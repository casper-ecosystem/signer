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

  async componentDidMount() {
    let w = await browser.windows.getCurrent();
    if (w.type === 'popup') {
      window.addEventListener('beforeunload', e => {
        this.props.signMessageContainer.cancel();
      });
    }
  }

  createRow(key: string, value: any) {
    return { key, value };
  }

  truncateString(
    longString: string,
    startChunk: number,
    endChunk: number
  ): string {
    return (
      longString.substring(0, startChunk) +
      '...' +
      longString.substring(longString.length - endChunk)
    );
  }

  render() {
    if (this.props.signMessageContainer.deployToSign) {
      const deployId = this.props.signMessageContainer.deployToSign.id;
      if (deployId) {
        this.props.signMessageContainer
          .parseDeployData(deployId)
          .then(deployData => {
            this.setState({
              rows: [
                this.createRow(
                  'Signing Key',
                  this.truncateString(deployData.signingKey, 6, 6)
                ),
                this.createRow(
                  'Account',
                  this.truncateString(deployData.account, 6, 6)
                ),
                this.createRow(
                  'Hash',
                  this.truncateString(deployData.deployHash, 6, 6)
                ),
                this.createRow('Timestamp', deployData.timestamp),
                this.createRow('Chain Name', deployData.chainName),
                this.createRow('Gas Price', deployData.gasPrice),
                this.createRow('Deploy Type', deployData.deployType)
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
