import { observer } from 'mobx-react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { Form, TextField } from './Forms';
import AccountManager, { saveToFile } from '../container/AccountManager';
import { RouteComponentProps, withRouter } from 'react-router';
import { observable } from 'mobx';
import {
  CreateAccountFormData,
  ImportAccountFormData
} from '../container/ImportAccountContainer';
import * as nacl from 'tweetnacl-ts';
import ErrorContainer from '../container/ErrorContainer';

interface Props extends RouteComponentProps {
  authContainer: AccountManager;
  errors: ErrorContainer;
  action: 'Import' | 'Create';
}

@observer
class AccountPage extends React.Component<Props, {}> {
  @observable accountForm: ImportAccountFormData | CreateAccountFormData;

  constructor(props: Props) {
    super(props);
    if (props.action === 'Import') {
      this.accountForm = new ImportAccountFormData();
    } else {
      this.accountForm = new CreateAccountFormData();
    }
  }

  async onCreateAccount() {
    const formData = this.accountForm as CreateAccountFormData;
    if (formData.submitDisabled) {
      return;
    }

    const names = this.props.authContainer.userAccounts.map(
      account => account.name
    );
    if (names.includes(formData.name.$)) {
      return this.props.errors.capture(
        Promise.reject(
          new Error(`An account with name '${formData.name.$}' already exists.`)
        )
      );
    }

    // Save the private and public keys to disk.
    saveToFile(formData.privateKeyBase64.$, `${formData.name.$}.private.key`);
    saveToFile(formData.publicKeyBase64.$, `${formData.name.$}.public.key`);
    await this._onSubmit();
  }

  onImportAccount() {
    if (this.accountForm.submitDisabled) {
      return;
    }
    this._onSubmit();
  }

  async _onSubmit() {
    await this.props.authContainer.importUserAccount(
      this.accountForm.name.$,
      this.accountForm.privateKeyBase64.$
    );
    this.accountForm.resetFields();
    this.props.history.goBack();
  }

  renderImportForm() {
    return (
      <Form
        onSubmit={() => {
          this.onImportAccount();
        }}
      >
        <TextField
          label="Private Key"
          placeholder="Base64 encoded Ed25519 secret key"
          id="import-private-key"
          fieldState={this.accountForm.privateKeyBase64}
        />
        <TextField
          label="Name"
          placeholder="Human Readable Alias"
          id="import-name"
          fieldState={this.accountForm.name}
        />
        <Button
          className="mt-5"
          disabled={this.accountForm.submitDisabled}
          type="submit"
          block={true}
        >
          Import
        </Button>
      </Form>
    );
  }

  renderCreateForm() {
    const formData = this.accountForm as CreateAccountFormData;
    return (
      <Form
        onSubmit={() => {
          this.onCreateAccount();
        }}
      >
        <TextField
          label="Name"
          placeholder="Human Readable Alias"
          id="import-name"
          fieldState={this.accountForm.name}
        />
        <TextField
          readonly={true}
          id="id-signature-algorithm"
          label="Signature Algorithm"
          fieldState={'Ed25519'}
        />
        <TextField
          readonly={true}
          label="Public Key (Base16)"
          id="create-public-key"
          fieldState={
            formData.publicKeyBase64.$
              ? nacl.encodeHex(nacl.decodeBase64(formData.publicKeyBase64.$))
              : ''
          }
        />
        <TextField
          readonly={true}
          label="Private Key (Base64)"
          placeholder="Base64 encoded Ed25519 secret key"
          id="create-private-key"
          fieldState={formData.privateKeyBase64}
        />
        <Button
          className="mt-5"
          disabled={this.accountForm.submitDisabled}
          type="submit"
          block={true}
        >
          Create
        </Button>
      </Form>
    );
  }

  render() {
    return (
      <div>
        <div className="mt-5 mb-4">
          {this.accountForm instanceof CreateAccountFormData
            ? this.renderCreateForm()
            : this.renderImportForm()}
        </div>
      </div>
    );
  }
}

export default withRouter(AccountPage);
