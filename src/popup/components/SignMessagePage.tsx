import { observer } from 'mobx-react';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import SignMessageContainer from '../container/SignMessageContainer';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';
import AccountManager from '../container/AccountManager';
import { Button } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

interface Props extends RouteComponentProps {
  signMessageContainer: SignMessageContainer;
  authContainer: AccountManager;
}

@observer
class SignMessagePage extends React.Component<Props, {}> {
  async componentDidMount() {
    let w = await browser.windows.getCurrent();
    if (w.type === 'popup') {
      window.addEventListener('beforeunload', e => {
        this.props.signMessageContainer.cancel();
      });
    }
  }

  render() {
    if (this.props.signMessageContainer.toSignMessage) {
      return (
        <div style={{ flexGrow: 1 }}>
          <Typography align={'center'} variant={'h5'}>
            Your signature is being requested
          </Typography>

          <Box mt={4} mb={3}>
            {this.props.authContainer.selectedUserAccount && (
              <Typography variant={'h6'}>
                Active key:&nbsp;
                {this.props.authContainer.selectedUserAccount.name}
              </Typography>
            )}
            <Typography variant={'h6'}>Deploy hash (base16):</Typography>
            <Typography style={{ wordBreak: 'break-all' }}>
              {this.props.signMessageContainer.toSignMessage!.data}
            </Typography>
          </Box>
          <Box mt={8}>
            <Grid
              container
              spacing={4}
              justify={'center'}
              alignItems={'center'}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    this.props.signMessageContainer.cancel();
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => this.props.signMessageContainer.signMessage()}
                  variant="contained"
                  color="primary"
                >
                  Sign
                </Button>
              </Grid>
            </Grid>
          </Box>
        </div>
      );
    } else {
      return <Redirect to={Pages.Home} />;
    }
  }
}

export default withRouter(SignMessagePage);
