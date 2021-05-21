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
import { deployWithID } from '../../background/SignMessageManager';

interface Props extends RouteComponentProps {
  signMessageContainer: SignMessageContainer;
  authContainer: AccountManager;
}

@observer
class SignMessagePage extends React.Component<
  Props,
  { rows: any; deployToSign: deployWithID | null }
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rows: [],
      deployToSign: this.props.signMessageContainer.deployToSign
    };
  }

  async componentDidMount() {
    let w = await browser.windows.getCurrent();
    if (w.type === 'popup') {
      window.addEventListener('beforeunload', e => {
        this.props.signMessageContainer.cancel(this.state.deployToSign?.id!);
      });
    }
    if (this.state.deployToSign) {
      this.generateDeployInfo(this.state.deployToSign);
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

  async generateDeployInfo(deployToSign: deployWithID) {
    let deployData = await this.props.signMessageContainer.parseDeployData(
      deployToSign.id
    );
    let baseRows = [
      this.createRow(
        'Signing Key',
        this.truncateString(deployData.signingKey, 6, 6)
      ),
      this.createRow('Account', this.truncateString(deployData.account, 6, 6)),
      this.createRow('Hash', this.truncateString(deployData.deployHash, 6, 6)),
      this.createRow('Timestamp', deployData.timestamp),
      this.createRow('Chain Name', deployData.chainName),
      this.createRow('Gas Price', deployData.gasPrice),
      this.createRow('Deploy Type', deployData.deployType)
    ];
    if (deployData.deployType === 'Transfer') {
      this.setState({
        rows: [
          ...baseRows,
          this.createRow('To', this.truncateString(deployData.target!, 6, 6)),
          this.createRow('Amount', deployData.amount)
          // this.createRow('Transfer ID', deployData.id)
        ]
      });
    } else {
      this.setState({ rows: baseRows });
    }
  }

  render() {
    console.log('Page is re-rendering...');
    if (this.state.deployToSign) {
      const deployId = this.props.signMessageContainer.deployToSign?.id;
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
                    this.props.signMessageContainer.cancel(deployId!);
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() =>
                    this.props.signMessageContainer.signDeploy(deployId!)
                  }
                  variant="contained"
                  color="primary"
                  style={{
                    backgroundColor: 'var(--cspr-dark-blue)'
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
