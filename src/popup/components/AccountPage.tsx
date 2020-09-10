import { observer } from 'mobx-react';
import React from 'react';
import AccountManager, { saveToFile } from '../container/AccountManager';
import { RouteComponentProps, withRouter } from 'react-router';
import { observable } from 'mobx';
import {
  CreateAccountFormData,
  ImportAccountFormData
} from '../container/ImportAccountContainer';
import ErrorContainer from '../container/ErrorContainer';
import { Button, createStyles, Theme, WithStyles } from '@material-ui/core';
import { TextFieldWithFormState } from './Forms';
import withStyles from '@material-ui/core/styles/withStyles';
import FormControl from '@material-ui/core/FormControl';
import { encodeBase16, Keys } from 'casperlabs-sdk';
import { decodeBase64 } from 'tweetnacl-ts';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTextField-root': {
        marginTop: theme.spacing(2)
      }
    },
    importButton: {
      marginTop: theme.spacing(8)
    }
  });

interface Props extends RouteComponentProps, WithStyles<typeof styles> {
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
    saveToFile(
      Keys.Ed25519.privateKeyEncodeInPem(
        decodeBase64(formData.privateKeyBase64.$!)
      ),
      `${formData.name.$}_secret_key.pem`
    );
    saveToFile(
      Keys.Ed25519.publicKeyEncodeInPem(
        decodeBase64(formData.publicKeyBase64.$!)
      ),
      `${formData.name.$}_public_key.pem`
    );
    const publicKeyBase16 = encodeBase16(
      decodeBase64(formData.publicKeyBase64.$!)
    );
    saveToFile('01' + publicKeyBase16, `${formData.name.$}_public_key_hex`);
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
      <form className={this.props.classes.root}>
        <TextFieldWithFormState
          fullWidth
          label="Private Key"
          placeholder="Base64 encoded Ed25519 secret key"
          id="import-private-key"
          fieldState={this.accountForm.privateKeyBase64}
        />
        <TextFieldWithFormState
          fullWidth
          label="Name"
          placeholder="Human Readable Alias"
          id="import-name"
          fieldState={this.accountForm.name}
        />
        <FormControl fullWidth className={this.props.classes.importButton}>
          <Button
            disabled={this.accountForm.submitDisabled}
            color="primary"
            variant={'contained'}
            onClick={() => {
              this.onImportAccount();
            }}
          >
            Import
          </Button>
        </FormControl>
      </form>
    );
  }

  renderCreateForm() {
    const formData = this.accountForm as CreateAccountFormData;
    return (
      <form className={this.props.classes.root}>
        <TextFieldWithFormState
          fullWidth
          label="Name"
          placeholder="Human Readable Alias"
          id="import-name"
          fieldState={this.accountForm.name}
        />
        <TextFieldWithFormState
          fullWidth
          id="id-signature-algorithm"
          label="Signature Algorithm"
          InputProps={{
            readOnly: true,
            disabled: true
          }}
          defaultValue={'Ed25519'}
        />
        <TextFieldWithFormState
          fullWidth
          InputProps={{ readOnly: true, disabled: true }}
          label="Public Key (Base16)"
          id="create-public-key"
          value={
            formData.publicKeyBase64.$
              ? Buffer.from(formData.publicKeyBase64.$, 'base64').toString(
                  'hex'
                )
              : ''
          }
        />
        <TextFieldWithFormState
          fullWidth
          InputProps={{ readOnly: true, disabled: true }}
          label="Private Key (Base64)"
          placeholder="Base64 encoded Ed25519 secret key"
          id="create-private-key"
          defaultValue={formData.privateKeyBase64.value}
        />
        <FormControl fullWidth margin={'normal'}>
          <Button
            className="mt-5"
            disabled={this.accountForm.submitDisabled}
            color="primary"
            variant="contained"
            onClick={() => {
              this.onCreateAccount();
            }}
          >
            Create
          </Button>
        </FormControl>
      </form>
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

export default withStyles(styles, { withTheme: true })(withRouter(AccountPage));
