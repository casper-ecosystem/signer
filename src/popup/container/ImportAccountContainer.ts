import { FieldState } from 'formstate';
import { fieldSubmittable, valueRequired } from '../../lib/FormValidator';
import { action, computed } from 'mobx';
import * as nacl from 'tweetnacl-ts';

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

  constructor() {
    super();
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
