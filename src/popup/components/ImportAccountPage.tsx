import { observer } from 'mobx-react';
import React from 'react';
import { Button } from 'react-bootstrap';
import { Form, TextField } from './Forms';
import { ImportAccountContainer } from '../container/ImportAccountContainer';
import AccountManager from '../container/AccountManager';
import { RouteComponentProps, withRouter } from 'react-router';

interface Props extends RouteComponentProps {
  importAccountContainer: ImportAccountContainer;
  authContainer: AccountManager;
}

@observer
class ImportAccountPage extends React.Component<Props, {}> {
  async onSubmit() {
    await this.props.authContainer.importUserAccount(
      this.props.importAccountContainer.name.$,
      this.props.importAccountContainer.privateKey.$
    );
    this.props.importAccountContainer.resetFields();
    this.props.history.goBack();
  }

  render() {
    return (
      <div>
        <div className="mt-5 mb-4">
          <Form
            onSubmit={() => {
              this.onSubmit();
            }}
          >
            <TextField
              label="Private Key"
              placeholder="Base64 encoded Ed25519 secret key"
              id="import-private-key"
              fieldState={this.props.importAccountContainer.privateKey}
            />
            <TextField
              label="Name"
              placeholder="Human Readable Alias"
              id="import-name"
              fieldState={this.props.importAccountContainer.name}
            />
            <Button
              className="mt-5"
              disabled={this.props.importAccountContainer.submitDisabled}
              type="submit"
              block={true}
            >
              Import
            </Button>
          </Form>
        </div>
      </div>
    );
  }
}

export default withRouter(ImportAccountPage);
