import React from 'react';
// see https://github.com/mobxjs/mobx-react-lite/#observer-batching
import 'mobx-react-lite/batchingForReactDom';
import './App.scss';
import { Route, Switch } from 'react-router-dom';
import Pages from './components/Pages';
import Home from './components/Home';
import AccountManager from './container/AccountManager';
import PopupManager from '../background/PopupManager';
import { HomeContainer } from './container/HomeContainer';
import { observer } from 'mobx-react';
import ErrorContainer from './container/ErrorContainer';
import SignDeployPage from './components/SignDeployPage';
import SigningContainer from './container/SigningContainer';
import ConnectSignerPage from './components/ConnectSignerPage';
import ConnectSignerContainer from './container/ConnectSignerContainer';
import AccountPage from './components/AccountPage';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Container } from '@material-ui/core';
import { MainAppBar } from './components/MainAppBar';
import AnalyticsProvider from './components/AnalyticsProvider';
import AccountManagementPage from './components/AccountManagementPage';
import { ConnectedSitesPage } from './components/ConnectedSitesPage';
import { useIdleTimer } from 'react-idle-timer';
import { SignMessagePage } from './components/SignMessagePage';
import { ConfigureTimeoutPage } from './components/ConfigureTimeout';
import PopupContainer from './container/PopupContainer';

export interface AppProps {
  errors: ErrorContainer;
  authContainer: AccountManager;
  homeContainer: HomeContainer;
  signingContainer: SigningContainer;
  connectSignerContainer: ConnectSignerContainer;
  popupContainer: PopupContainer;
}

const App = observer((props: AppProps) => {
  const lockOnIdle = () => {
    if (props.authContainer.isUnLocked) props.authContainer.lock();
  };

  useIdleTimer({
    timeout: 1000 * 60 * props.authContainer.idleTimeoutMins,
    onIdle: lockOnIdle,
    debounce: 500
  });

  return (
    <div>
      <AnalyticsProvider />
      <MainAppBar
        authContainer={props.authContainer}
        connectionContainer={props.connectSignerContainer}
      />
      <Container>
        <Alerts {...props} />
        <Switch>
          <Route
            exact
            path={Pages.Home}
            render={_ => (
              <Home
                authContainer={props.authContainer}
                homeContainer={props.homeContainer}
                connectionContainer={props.connectSignerContainer}
                signingContainer={props.signingContainer}
                popupContainer={props.popupContainer}
                errors={props.errors}
              />
            )}
          />
          <Route
            exact
            path={Pages.AccountManagement}
            render={_ => (
              <AccountManagementPage
                authContainer={props.authContainer}
                connectionContainer={props.connectSignerContainer}
                errorsContainer={props.errors}
              />
            )}
          />
          <Route
            exact
            path={Pages.ConnectedSites}
            render={_ => (
              <ConnectedSitesPage
                connectionContainer={props.connectSignerContainer}
                authContainer={props.authContainer}
              />
            )}
          />
          <Route
            path={Pages.ImportAccount}
            exact
            render={_ => (
              <AccountPage
                errors={props.errors}
                action={'Import'}
                authContainer={props.authContainer}
              />
            )}
          />
          <Route
            path={Pages.CreateAccount}
            exact
            render={_ => (
              <AccountPage
                errors={props.errors}
                action={'Create'}
                authContainer={props.authContainer}
              />
            )}
          />
          <Route
            path={Pages.SignDeploy}
            exact
            render={_ => (
              <SignDeployPage
                signingContainer={props.signingContainer}
                authContainer={props.authContainer}
              />
            )}
          />
          <Route
            path={Pages.SignMessage}
            exact
            render={_ =>
              SignMessagePage({
                signingContainer: props.signingContainer,
                popupContainer: props.popupContainer
              })
            }
          />
          <Route
            path={Pages.ConnectSigner}
            exact
            render={_ => (
              <ConnectSignerPage
                connectSignerContainer={props.connectSignerContainer}
                authContainer={props.authContainer}
              />
            )}
          />
          <Route
            path={Pages.ConfigureTimeout}
            exact
            render={_ => (
              <ConfigureTimeoutPage accountManager={props.authContainer} />
            )}
          />
        </Switch>
      </Container>
    </div>
  );
});

export default App;

// Alerts displays the outcome of the last async error on the top of the page.
// Dismissing the error clears the state and removes the element.
const Alerts = observer((props: AppProps) => {
  if (props.errors.lastError == null) return null;
  // Not using the `data-dismiss="alert"` to dismiss via Bootstrap JS
  // becuase then it doesn't re-render when there's a new error.
  return (
    <div id="alert-message">
      <Alert severity="error" onClose={() => props.errors.dismissLast()}>
        <AlertTitle>Error!</AlertTitle>
        {props.errors.lastError}
      </Alert>
    </div>
  );
});
