import { FieldState } from 'formstate';
import { fieldSubmittable, valueRequired } from '../../lib/FormValidator';
import { action, computed, observable } from 'mobx';
import * as nacl from 'tweetnacl-ts';
import React from 'react';
import { encodeBase64 } from 'tweetnacl-util';
import ErrorContainer from './ErrorContainer';
import { Keys } from 'casperlabs-sdk';
import { SignKeyPair } from 'tweetnacl-ts';

export interface SubmittableFormData {
  submitDisabled: boolean;
  resetFields: () => void;
}

export class ImportAccountFormData implements SubmittableFormData {
  privateKeyBase64: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );
  name: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );
  @observable file: File | null = null;
  private key: SignKeyPair | null = null;

  private checkFileContent(fileContent: string) {
    if (!fileContent) {
      return 'The content of imported file cannot be empty!';
    }
    try {
      const privateKey = Keys.Ed25519.parsePrivateKey(
        Keys.Ed25519.readBase64WithPEM(fileContent)
      );
      this.key = nacl.sign_keyPair_fromSeed(privateKey);
    } catch (e) {
      return e.message;
    }
    return null;
  }

  constructor(private errors: ErrorContainer) {}

  handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      this.file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsText(this.file);
      reader.onload = e => {
        const errorMsg = this.checkFileContent(reader.result as string);
        if (errorMsg === null) {
          const fileName = this.file?.name!.split('.')[0];
          if (fileName !== undefined) {
            const name = fileName.replace(/_secret_key$/, '');
            this.name.onChange(name);
            this.privateKeyBase64.onChange(encodeBase64(this.key?.secretKey!));
          } else {
            this.errors.capture(
              Promise.reject(new Error('fileName was undefined.'))
            );
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
      fieldSubmittable(this.privateKeyBase64) && fieldSubmittable(this.name)
    );
  }

  @action
  resetFields() {
    this.privateKeyBase64.reset();
    this.name.reset();
  }
}

export class CreateAccountFormData extends ImportAccountFormData {
  publicKeyBase64: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );

  constructor(errors: ErrorContainer) {
    super(errors);
    let newKeyPair = nacl.sign_keyPair();
    this.publicKeyBase64.onChange(nacl.encodeBase64(newKeyPair.publicKey));
    this.privateKeyBase64.onChange(nacl.encodeBase64(newKeyPair.secretKey));
  }

  @computed
  get submitDisabled(): boolean {
    return !(
      fieldSubmittable(this.privateKeyBase64) &&
      fieldSubmittable(this.name) &&
      fieldSubmittable(this.publicKeyBase64)
    );
  }

  @action
  resetFields() {
    super.resetFields();
    this.publicKeyBase64.reset();
  }
}
