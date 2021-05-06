import { observer } from 'mobx-react';
import React from 'react';
import AccountManager from '../container/AccountManager';
import PopupManager from '../../background/PopupManager';
import { RouteComponentProps, withRouter } from 'react-router';
import { observable } from 'mobx';
import {
  CreateAccountFormData,
  ImportAccountFormData
} from '../container/ImportAccountContainer';
import ErrorContainer from '../container/ErrorContainer';
import {
  Button,
  Checkbox,
  createStyles,
  Theme,
  Typography,
  WithStyles,
  FormControlLabel,
  FormControl,
  Box
} from '@material-ui/core';
import { TextFieldWithFormState } from './Forms';
import withStyles from '@material-ui/core/styles/withStyles';
import { decodeBase16, decodeBase64, Keys } from 'casper-client-sdk';
import { KeyPairWithAlias } from '../../@types/models';

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
class AccountPage extends React.Component<
  Props,
  { keyDownloadEnabled: boolean }
> {
  @observable accountForm: ImportAccountFormData | CreateAccountFormData;

  private popupManager: PopupManager;

  constructor(props: Props) {
    super(props);
    if (props.action === 'Import') {
      this.accountForm = new ImportAccountFormData(props.errors);
    } else {
      this.accountForm = new CreateAccountFormData(props.errors);
    }
    this.state = {
      keyDownloadEnabled: false
    };
    this.popupManager = new PopupManager();
  }

  async onCreateAccount() {
    const formData = this.accountForm as CreateAccountFormData;
    if (formData.submitDisabled) {
      return;
    }

    const names = this.props.authContainer.userAccounts.map(
      account => account.alias
    );
    if (names.includes(formData.name.$)) {
      return this.props.errors.capture(
        Promise.reject(
          new Error(`An account with name '${formData.name.$}' already exists.`)
        )
      );
    }

    // TODO: extend support to Secp256k1
    const keyPair: KeyPairWithAlias = {
      alias: formData.name.$,
      KeyPair: Keys.Ed25519.parseKeyPair(
        decodeBase16(formData.publicKey.$.substring(2)),
        decodeBase64(formData.secretKeyBase64.value)
      )
    };

    if (this.state.keyDownloadEnabled) {
      this.props.authContainer.downloadPemFiles(keyPair);
    }

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
      this.accountForm.secretKeyBase64.value
    );
    this.accountForm.resetFields();
    this.props.history.goBack();
  }

  renderImportForm() {
    const form = this.accountForm as ImportAccountFormData;
    return (
      <form className={this.props.classes.root}>
        <FormControl>
          <Typography id="continuous-slider" gutterBottom>
            Secret Key File
          </Typography>
          <Box
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            m={1}
          >
            <Button
              id={'private-key-uploader'}
              variant="contained"
              color="primary"
              component="label"
            >
              Upload
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  form.handleFileSelect(e)
                }
              />
            </Button>
            <Box ml={1}>
              <Typography>
                <Box fontSize={12}>
                  {form.file ? form.file.name : 'No file selected'}
                </Box>
              </Typography>
            </Box>
          </Box>
        </FormControl>
        <TextFieldWithFormState
          fullWidth
          label="Name"
          placeholder="Human Readable Alias"
          id="import-name"
          fieldState={this.accountForm.name}
        />
        <FormControl fullWidth className={this.props.classes.importButton}>
          <Button
            type="submit"
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
    const toggleDownloadKey = (event: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({
        ...this.state,
        keyDownloadEnabled: event.target.checked
      });
    };
    return (
      <form className={this.props.classes.root}>
        <TextFieldWithFormState
          aria-label="Input for setting name of key"
          autoFocus
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
          label="Public Key"
          id="create-public-key"
          value={formData.publicKey.$ ? formData.publicKey.$ : ''}
        />
        <TextFieldWithFormState
          fullWidth
          InputProps={{ readOnly: true, disabled: true }}
          label="Secret Key (Base64)"
          placeholder="Base64 encoded Ed25519 secret key"
          id="create-private-key"
          defaultValue={formData.secretKeyBase64.value}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.keyDownloadEnabled}
              onChange={toggleDownloadKey}
              name="keyDownloadToggle"
            />
          }
          label="Download Key"
        />
        <FormControl fullWidth margin={'normal'}>
          <Button
            type="submit"
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
