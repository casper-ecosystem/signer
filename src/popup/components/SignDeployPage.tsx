import { observer } from 'mobx-react';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import SigningContainer, { parseRow } from '../container/SigningContainer';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';
import AccountManager from '../container/AccountManager';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { deployWithID } from '../../background/SigningManager';
import PopupContainer from '../container/PopupContainer';
import { SigningDataRow } from '../../shared';
import { BlankTooltipContent, TooltippedTableRow } from './Tooltipped';

interface Props extends RouteComponentProps {
  signingContainer: SigningContainer;
  accountManager: AccountManager;
  popupContainer: PopupContainer;
}

@observer
class SignDeployPage extends React.Component<
  Props,
  {
    genericRows: SigningDataRow[];
    deploySpecificRows: SigningDataRow[];
    deployToSign: deployWithID | null;
    argsExpanded: boolean;
  }
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      genericRows: [],
      deploySpecificRows: [],
      deployToSign: this.props.signingContainer.deployToSign,
      argsExpanded: false
    };
  }

  async componentDidMount() {
    let w = await browser.windows.getCurrent();
    if (w.type === 'popup') {
      window.addEventListener('beforeunload', e => {
        this.props.signingContainer.cancel(this.state.deployToSign?.id!);
      });
    }
    if (this.state.deployToSign) {
      this.generateDeployInfo(this.state.deployToSign);
    }
  }

  async generateDeployInfo(deployToSign: deployWithID) {
    const deployData = await this.props.signingContainer.parseDeployData(
      deployToSign.id
    );
    // Filters out non-generic and irrelevant data points, also re-orders.
    const orderedGenericData = {
      'Signing Key': deployData.signingKey,
      Account: deployData.account,
      'Deploy Hash': deployData.deployHash,
      Timestamp: deployData.timestamp,
      'Chain Name': deployData.chainName,
      Payment: deployData.payment,
      'Deploy Type': deployData.deployType
    };
    let baseRows: SigningDataRow[] = [];
    for (let [key, value] of Object.entries(orderedGenericData)) {
      const row = parseRow({ key, value, tooltipContent: BlankTooltipContent });
      baseRows.push(row);
    }
    let argRows: SigningDataRow[] = [];
    for (let [key, value] of Object.entries(deployData.deployArgs)) {
      const row = parseRow({ key, value, tooltipContent: BlankTooltipContent });
      argRows.push(row);
    }
    this.setState({
      genericRows: baseRows,
      deploySpecificRows: argRows,
      argsExpanded: argRows.length < 4
    });
  }

  render() {
    if (this.state.deployToSign && this.props.accountManager.isUnLocked) {
      const deployId = this.props.signingContainer.deployToSign?.id;
      return (
        <div
          style={{
            flexGrow: 1,
            marginTop: '-30px',
            width: '100vw'
          }}
        >
          <Typography align={'center'} variant={'h6'}>
            Signature Request
          </Typography>
          <TableContainer>
            <Table style={{ width: '90%' }}>
              <TableBody>
                {/* 
                  Displays the data generic to all deploys
                */}
                {this.state.genericRows.map(row => (
                  <TooltippedTableRow data={row} />
                ))}
                {/* 
                  Deploy Specific Arguments
                  Special handling for native transfers
                */}
                {this.state.genericRows.some(
                  row => row.key === 'Deploy Type' && row.value === 'Transfer'
                ) ? (
                  <>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ fontWeight: 'bold' }}
                        colSpan={2}
                        align="center"
                      >
                        Transfer Data
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={2}
                      >
                        <Table size="small">
                          <TableBody>
                            {this.state.deploySpecificRows.map(row => (
                              <TooltippedTableRow data={row} />
                            ))}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  /**
                   *  Deploy specific arguments
                   */
                  <>
                    <TableRow>
                      <TableCell
                        component="th"
                        scope="row"
                        style={{ fontWeight: 'bold' }}
                      >
                        Contract Arguments
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() =>
                            this.setState({
                              argsExpanded: !this.state.argsExpanded
                            })
                          }
                        >
                          {this.state.argsExpanded ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={2}
                      >
                        <Collapse
                          in={this.state.argsExpanded}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Table size="small">
                            <TableBody>
                              {this.state.deploySpecificRows.map(row => (
                                <TooltippedTableRow data={row} />
                              ))}
                            </TableBody>
                          </Table>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={8}>
            <Grid
              container
              style={{ marginTop: '-50px' }}
              spacing={4}
              justify={'center'}
              alignItems={'center'}
            >
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={async () => {
                    await this.props.signingContainer.cancel(deployId!);
                    await this.props.popupContainer.callClosePopup();
                    // This is required in the case that the user avoids the popup and instead
                    // interacts with the default extension window.
                    window.close();
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={async () => {
                    await this.props.signingContainer.signDeploy(deployId!);
                    await this.props.popupContainer.callClosePopup();
                    // This is required in the case that the user avoids the popup and instead
                    // interacts with the default extension window.
                    window.close();
                  }}
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

export default withRouter(SignDeployPage);
