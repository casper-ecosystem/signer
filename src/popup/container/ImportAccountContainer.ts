import { FieldState } from 'formstate';
import {
  fieldSubmittable,
  valueRequired,
  isAlgorithm
} from '../../lib/FormValidator';
import { action, computed, observable } from 'mobx';
import React from 'react';
import { encodeBase64 } from 'tweetnacl-util';
import ErrorContainer from './ErrorContainer';
import { Keys } from 'casper-client-sdk';
export interface SubmittableFormData {
  submitDisabled: boolean;
  resetFields: () => void;
}

export class ImportAccountFormData implements SubmittableFormData {
  secretKeyBase64: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );
  algorithm: FieldState<string> = new FieldState<string>('').validators(
    valueRequired,
    isAlgorithm
  );
  name: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );
  @observable file: File | null = null;
  private keyPair: Keys.AsymmetricKey | null = null;

  private checkFileContent(fileContent: string) {
    if (!fileContent) {
      return 'The content of imported file cannot be empty!';
    }
    if (fileContent.includes('PUBLIC KEY')) {
      return 'Not a secret key file!';
    }
    return null;
  }

  constructor(private errors: ErrorContainer) {}

  handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.errors.lastError) {
      this.errors.dismissLast();
    }
    if (e.target.files) {
      this.file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(this.file);
      reader.onload = e => {
        const fileContents = reader.result as string;
        const errorMsg = this.checkFileContent(fileContents);
        if (errorMsg === null) {
          const file = this.file?.name!.split('.');
          if (file === undefined) {
            this.errors.capture(Promise.reject(new Error('File undefined')));
          } else {
            // File is not undefined now check format by extension
            const fileExt = file[1];
            if (fileExt !== 'pem') {
              this.errors.capture(
                Promise.reject(
                  new Error(
                    `Invalid file format: .${fileExt}. Please upload a .pem file.`
                  )
                )
              );
            } else {
              this.secretKeyBase64.onChange(
                encodeBase64(Keys.readBase64WithPEM(fileContents))
              );
            }
          }
        } else {
          this.errors.capture(Promise.reject(new Error(errorMsg)));
        }
      };
    }
  };

  @computed
  get submitDisabled(): boolean {
    return !(
      fieldSubmittable(this.secretKeyBase64) &&
      fieldSubmittable(this.name) &&
      fieldSubmittable(this.algorithm)
    );
  }

  @action
  resetFields() {
    this.secretKeyBase64.reset();
    this.algorithm.reset();
    this.name.reset();
  }
}

export class CreateAccountFormData extends ImportAccountFormData {
  publicKey: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );

  constructor(errors: ErrorContainer) {
    super(errors);
    let newEd25519KeyPair = Keys.Ed25519.new();
    this.publicKey.onChange(newEd25519KeyPair.publicKey.toAccountHex());
    this.secretKeyBase64.onChange(encodeBase64(newEd25519KeyPair.privateKey));
  }

  @computed
  get submitDisabled(): boolean {
    return !(
      fieldSubmittable(this.secretKeyBase64) &&
      fieldSubmittable(this.name) &&
      fieldSubmittable(this.publicKey)
    );
  }

  @action
  resetFields() {
    super.resetFields();
    this.publicKey.reset();
  }
}
