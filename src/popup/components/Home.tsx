import React from 'react';
import logo from '../img/CasperLabs_Logo_Favicon_RGB_50px.png';
import { Form, TextField } from './Forms';
import { Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import AccountManager from '../container/AccountManager';
import { HomeContainer } from '../container/HomeContainer';
import { observer } from 'mobx-react';
import Pages from './Pages';
import { LinkButton } from './Utils';
import { RouteComponentProps, withRouter } from 'react-router';

interface Props extends RouteComponentProps {
  authContainer: AccountManager;
  homeContainer: HomeContainer;
}

@observer
class Home extends React.Component<Props, {}> {
  renderCreateNewVault() {
    return (
      <div>
        <div className="mt-5 mb-4 text-center">
          <img src={logo} alt="logo" width={120} />
        </div>
        <h2 className="text-center mb-5">New Vault</h2>

        <div>
          <Form
            onSubmit={async () => {
              const password = this.props.homeContainer.passwordField.$;
              await this.props.authContainer.createNewVault(password);
              this.props.homeContainer.passwordField.reset();
            }}
          >
            <TextField
              label="Set Password"
              type="password"
              placeholder="Password"
              id="set-password"
              fieldState={this.props.homeContainer.passwordField}
            />
            <Button
              disabled={this.props.homeContainer.submitDisabled}
              type="submit"
              block={true}
            >
              Creating Vault
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  renderAccountLists() {
    return (
      <div>
        <div className="mt-5 mb-4 text-center">
          <img src={logo} alt="logo" width={120} />
        </div>
        <h5 className="mt-4 mb-3 text-center">
          You have {this.props.authContainer.userAccounts.length} account key(s)
        </h5>
        <div className="text-center" style={{ marginTop: '100px' }}>
          <LinkButton title="Import Account" path={Pages.ImportAccount} />
        </div>
      </div>
    );
  }

  renderUnlock() {
    return (
      <div>
        <div className="mt-5 mb-4 text-center">
          <img src={logo} alt="logo" width={120} />
        </div>
        <h2 className="text-center mb-5">Unlock Vault</h2>
        <div>
          <Form
            onSubmit={async () => {
              let password = this.props.homeContainer.passwordField.$;
              try {
                await this.props.authContainer.unlock(password);
                this.props.homeContainer.passwordField.reset();
              } catch (e) {
                this.props.homeContainer.passwordField.setError(e.message);
              }
            }}
          >
            <TextField
              type="password"
              placeholder="Password"
              id="unlock-password"
              fieldState={this.props.homeContainer.passwordField}
            />
            <Button
              disabled={this.props.homeContainer.submitDisabled}
              type="submit"
              block={true}
            >
              Unlock
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.authContainer.hasCreatedVault) {
      if (this.props.authContainer.isUnLocked) {
        if (this.props.authContainer.toSignMessages.length > 0) {
          return <Redirect to={Pages.SignMessage} />;
        } else {
          return this.renderAccountLists();
        }
      } else {
        return this.renderUnlock();
      }
    } else {
      return this.renderCreateNewVault();
    }
  }
}

export default withRouter(Home);
