import { observer } from 'mobx-react';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import SignMessageContainer from '../container/SignMessageContainer';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';
import AccountManager from '../container/AccountManager';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

interface Props extends RouteComponentProps {
  signMessageContainer: SignMessageContainer;
  authContainer: AccountManager;
}

@observer
class SignMessagePage extends React.Component<Props, { rows: any }> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rows: []
    };
  }

  createRow(key: string, value: any) {
    return { key, value };
  }

  async componentDidMount() {
    let w = await browser.windows.getCurrent();
    if (w.type === 'popup') {
      window.addEventListener('beforeunload', e => {
        this.props.signMessageContainer.cancel();
      });
    }
  }

  render() {
    if (this.props.signMessageContainer.deployToSign) {
      const deployWithID = this.props.signMessageContainer.deployToSign;
      if (deployWithID) {
        this.props.signMessageContainer
          .parseDeployData(deployWithID)
          .then(deploy => {
            let key = deploy.signingKey;
            console.log('Hello');
            this.setState({
              rows: [
                this.createRow(
                  'Signing Key',
                  key.substring(0, 6) + '...' + key.substring(key.length - 4)
                ),
                // this.createRow('Account', deploy.account),
                // this.createRow('Hash', deploy.deployHash),
                this.createRow('Timestamp', deploy.timestamp),
                this.createRow('Chain Name', deploy.chainName),
                this.createRow('Gas Price', deploy.gasPrice)
                // this.createRow('Deploy Type', deploy.deployType)
              ]
            });
          });
      }
      return (
        <div style={{ flexGrow: 1, marginTop: '-30px' }}>
          <Typography align={'center'} variant={'h6'}>
            Signature Request
          </Typography>
          <TableContainer>
            <Table style={{ maxWidth: '100%' }}>
              <TableBody>
                {this.state.rows.map((row: any) => (
                  <TableRow key={row.key}>
                    <TableCell component="th" scope="row">
                      {row.key}
                    </TableCell>
                    <TableCell align="right">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
                  onClick={() => this.props.signMessageContainer.signDeploy()}
                  variant="contained"
                  color="primary"
                  style={{
                    backgroundColor: '#181d41'
                  }}
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
