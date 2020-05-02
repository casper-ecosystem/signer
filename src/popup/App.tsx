import React from 'react';
import './App.scss';
import { Route, Switch } from 'react-router-dom';
import Pages from './components/Pages';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Home from './components/Home';
import AccountManager from './container/AccountManager';
import { HomeContainer } from './container/HomeContainer';
import Menu from './components/Menu';
import { observer } from 'mobx-react';
import ErrorContainer from '../../../ui/src/containers/ErrorContainer';
import ImportAccountPage from './components/ImportAccountPage';
import { ImportAccountContainer } from './container/ImportAccountContainer';
import SignMessagePage from './components/SignMessagePage';
import SignMessageContainer from './container/SignMessageContainer';

export interface AppProps {
  errors: ErrorContainer;
  authContainer: AccountManager;
  homeContainer: HomeContainer;
  importAccountContainer: ImportAccountContainer;
  signMessageContainer: SignMessageContainer;
}

const App = (props: AppProps) => {
  return (
    <div>
      <Menu authContainer={props.authContainer} />
      <div>
        <div className="container-fluid">
          <Alerts {...props} />
          <Switch>
            <Route
              exact
              path={Pages.Home}
              render={_ => (
                <Home
                  authContainer={props.authContainer}
                  homeContainer={props.homeContainer}
                />
              )}
            />
            <Route
              path={Pages.ImportAccount}
              exact
              render={_ => (
                <ImportAccountPage
                  importAccountContainer={props.importAccountContainer}
                  authContainer={props.authContainer}
                />
              )}
            />
            <Route
              path={Pages.SignMessage}
              exact
              render={_ => (
                <SignMessagePage
                  signMessageContainer={props.signMessageContainer}
                />
              )}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default App;

// Alerts displays the outcome of the last async error on the top of the page.
// Dismissing the error clears the state and removes the element.
const Alerts = observer((props: AppProps) => {
  if (props.errors.lastError == null) return null;
  // Not using the `data-dismiss="alert"` to dismiss via Bootstrap JS
  // becuase then it doesn't re-render when there's a new error.
  return (
    <div id="alert-message">
      <div
        className="alert alert-danger alert-dismissible fade show"
        role="alert"
      >
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={_ => props.errors.dismissLast()}
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>Error!</strong> {props.errors.lastError}
      </div>
    </div>
  );
});
