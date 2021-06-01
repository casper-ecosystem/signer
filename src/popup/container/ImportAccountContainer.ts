import { FieldState } from 'formstate';
import {
  fieldSubmittable,
  valueRequired,
  isAlgorithm
} from '../../lib/FormValidator';
import { action, computed, observable } from 'mobx';
import { encodeBase64 } from 'tweetnacl-util';
import ErrorContainer from './ErrorContainer';
import { Keys } from 'casper-client-sdk';
import ASN1 from '@lapo/asn1js';
import Base64 from '@lapo/asn1js/base64';
import Hex from '@lapo/asn1js/hex';
export interface SubmittableFormData {
  submitDisabled: boolean;
  resetFields: () => void;
}

type Algorithms = 'ed25519' | 'secp256k1';

export class ImportAccountFormData implements SubmittableFormData {
  secretKeyBase64: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );
  algorithm: FieldState<string> = new FieldState<string>('').validators(
    valueRequired,
    isAlgorithm
  );
  algorithmType: Algorithms | undefined = undefined;

  name: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );
  reHex = /^\s*(?:[0-9A-Fa-f][0-9A-Fa-f]\s*)+$/;
  //prettier-ignore
  ed25519DerPrefix = Buffer.from([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
  @observable file: File | null = null;

  private decodeText(val: any): 'secp256k1' | 'ed25519' | undefined {
    try {
      const der: Uint8Array = this.reHex.test(val)
        ? Hex.decode(val)
        : Base64.unarmor(val);
      // if (der.slice(0, 15) === this.ed25519DerPrefix) return 'ed25519';
      const decoded = ASN1.decode(der);
      const pretty = decoded.toPrettyString().replace(/(\r\n|\n|\r)/gm, '');
      if (pretty.search('secp256k1') > -1) return 'secp256k1';
      if (pretty.search('curveEd25519') > -1) return 'ed25519';
    } catch (e) {
      console.error(e);
    }
  }

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
              let pem, parsedKey;
              const type = this.decodeText(fileContents);
              this.algorithmType = type;
              switch (type) {
                case 'ed25519': {
                  pem = Keys.Ed25519.readBase64WithPEM(fileContents);
                  parsedKey = Keys.Ed25519.parsePrivateKey(pem);
                  break;
                }
                case 'secp256k1': {
                  pem = Keys.Secp256K1.readBase64WithPEM(fileContents);
                  parsedKey = Keys.Secp256K1.parsePrivateKey(pem);
                  break;
                }
                default: {
                  throw new Error('Invalid algorithm selected');
                }
              }
              this.secretKeyBase64.onChange(encodeBase64(parsedKey));
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
      fieldSubmittable(this.secretKeyBase64) && fieldSubmittable(this.name)
    );
  }

  @action
  resetFields() {
    this.secretKeyBase64.reset();
    this.algorithmType = undefined;
    this.name.reset();
  }
}

export class CreateAccountFormData extends ImportAccountFormData {
  publicKey: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );

  constructor(errors: ErrorContainer) {
    super(errors);
    this.algorithm.onUpdate(fieldState => {
      switch (fieldState.value) {
        case 'ed25519': {
          let ed25519KP = Keys.Ed25519.new();
          this.publicKey.onChange(ed25519KP.publicKey.toAccountHex());
          this.secretKeyBase64.onChange(encodeBase64(ed25519KP.privateKey));
          break;
        }
        case 'secp256k1': {
          let secp256k1KP = Keys.Secp256K1.new();
          this.publicKey.onChange(secp256k1KP.publicKey.toAccountHex());
          this.secretKeyBase64.onChange(encodeBase64(secp256k1KP.privateKey));
          break;
        }
        default:
          throw new Error('Invalid algorithm');
      }
    });
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
