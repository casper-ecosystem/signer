import { FieldState } from 'formstate';
import { fieldSubmittable, valueRequired } from '../../lib/FormValidator';
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
    // TODO: Extend to support SECP256k1
    try {
      const secretKey = Keys.Ed25519.parsePrivateKey(
        Keys.Ed25519.readBase64WithPEM(fileContent)
      );
      const publicKey = Keys.Ed25519.privateToPublicKey(secretKey);
      this.keyPair = Keys.Ed25519.parseKeyPair(publicKey, secretKey);
    } catch {
      const secretKey = Keys.Secp256K1.parsePrivateKey(
        Keys.Secp256K1.readBase64WithPEM(fileContent)
      );
      const publicKey = Keys.Secp256K1.privateToPublicKey(secretKey);
      this.keyPair = Keys.Secp256K1.parseKeyPair(publicKey, secretKey, 'raw');
    } finally {
      if (!this.keyPair) {
        return 'Could not parse key as Ed25519 or Secp256k1';
      }
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
          if (fileName === undefined) {
            this.errors.capture(
              Promise.reject(new Error('File name undefined'))
            );
          } else {
            const name = fileName.replace(/_secret_key$/, '');
            this.name.onChange(name);
            this.secretKeyBase64.onChange(
              encodeBase64(this.keyPair?.privateKey!)
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
      fieldSubmittable(this.secretKeyBase64) && fieldSubmittable(this.name)
    );
  }

  @action
  resetFields() {
    this.secretKeyBase64.reset();
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
