import { observer } from 'mobx-react';
import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router';
import SigningContainer from '../container/SigningContainer';
import Pages from './Pages';
import { browser } from 'webextension-polyfill-ts';
import AccountManager from '../container/AccountManager';
import { withStyles } from '@material-ui/core/styles';
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
  Tooltip,
  Typography
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import { deployWithID } from '../../background/SigningManager';
import {
  truncateString,
  numberWithSpaces,
  motesToCSPR
} from '../../background/utils';
import { popupDimensions } from '../../shared/constants';
const styles = () => ({
  tooltip: {
    fontSize: '.8rem',
    width: '260px',
    margin: '10px 0 0 0'
  }
});

const CsprTooltip = withStyles({
  tooltip: {
    fontSize: '1rem',
    width: 'fit-content',
    margin: '10px 0 0 0',
    textAlign: 'center'
  }
})(Tooltip);

interface Props extends RouteComponentProps {
  signingContainer: SigningContainer;
  authContainer: AccountManager;
  classes: Record<keyof ReturnType<typeof styles>, string>;
}

@observer
class SignDeployPage extends React.Component<
  Props,
  {
    genericRows: {
      key: string;
      value: any;
      title: any;
    }[];
    deploySpecificRows: {
      key: string;
      value: any;
      title: any;
    }[];
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

  createRow(key: string, value: any, title?: any) {
    return { key, value, title };
  }

  async generateDeployInfo(deployToSign: deployWithID) {
    const deployData = await this.props.signingContainer.parseDeployData(
      deployToSign.id
    );
    const baseRows = [
      this.createRow(
        'Signing Key',
        truncateString(deployData.signingKey, 6, 6),
        deployData.signingKey
      ),
      this.createRow(
        'Account',
        truncateString(deployData.account, 6, 6),
        deployData.account
      ),
      this.createRow(
        'Deploy Hash',
        truncateString(deployData.deployHash, 6, 6),
        deployData.deployHash
      ),
      // this.createRow(
      //   'Body Hash',
      //   truncateString(deployData.bodyHash, 6, 6),
      //   deployData.bodyHash
      // ),
      this.createRow('Timestamp', deployData.timestamp),
      this.createRow('Chain Name', deployData.chainName),
      /*
        Gas Price refers to how much a caller is willing to pay per unit of gas.
      
        Currently there is no logic in place to prioritise those willing to pay more
        meaning there is no reason to set it higher than 1.
        
        In cspr.live Gas Price is fixed at 1 and the user has no visibility of it.
        
        Until Gas Price impacts contract execution I will omit it from the deploy data
        screen to reduce confusion for users.
      
      this.createRow('Gas Price', `${deployData.gasPrice} motes`),
      */
      this.createRow(
        'Transaction Fee',
        `${numberWithSpaces(deployData.payment)} motes`,
        `${motesToCSPR(deployData.payment)} CSPR`
      ),
      this.createRow('Deploy Type', deployData.deployType)
    ];
    let argRows = [];
    for (let [key, value] of Object.entries(deployData.deployArgs)) {
      let row = this.createRow(
        key,
        !Array.isArray(value) && value.length > 15
          ? truncateString(value, 6, 6)
          : value,
        !Array.isArray(value) && value.length > 12 ? value : undefined
      );
      argRows.push(row);
    }
    this.setState({
      genericRows: baseRows,
      deploySpecificRows: argRows,
      argsExpanded: argRows.length < 4
    });
  }

  render() {
    if (this.state.deployToSign && this.props.authContainer.isUnLocked) {
      const deployId = this.props.signingContainer.deployToSign?.id;
      return (
        <div
          style={{
            flexGrow: 1,
            marginTop: '-30px',
            width: popupDimensions.expandedWidth
          }}
        >
          <Typography align={'center'} variant={'h6'}>
            Signature Request
          </Typography>
          <TableContainer>
            <Table style={{ width: '90%' }}>
              <TableBody>
                {this.state.genericRows.map((row: any) =>
                  row.key === 'Amount' || row.key === 'Payment' ? (
                    <CsprTooltip
                      key={row.key}
                      title={row.title ? row.title : ''}
                      placement="top"
                    >
                      <TableRow key={row.key}>
                        <TableCell
                          component="th"
                          scope="row"
                          style={{ fontWeight: 'bold' }}
                        >
                          {row.key}
                        </TableCell>
                        <TableCell align="right">{row.value}</TableCell>
                      </TableRow>
                    </CsprTooltip>
                  ) : (
                    <Tooltip
                      key={row.key}
                      title={row.title ? row.title : ''}
                      classes={{ tooltip: this.props.classes.tooltip }}
                      placement="top"
                    >
                      <TableRow key={row.key}>
                        <TableCell
                          component="th"
                          scope="row"
                          style={{ fontWeight: 'bold' }}
                        >
                          {row.key}
                        </TableCell>
                        <TableCell align="right">{row.value}</TableCell>
                      </TableRow>
                    </Tooltip>
                  )
                )}
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
                            {this.state.deploySpecificRows.map((row, index) => {
                              return row.key === 'Amount' ? (
                                <CsprTooltip
                                  key={index}
                                  title={`${motesToCSPR(row.value)} CSPR`}
                                  placement="top"
                                >
                                  <TableRow key={index}>
                                    <TableCell
                                      component="th"
                                      scope="row"
                                      style={{ fontWeight: 'bold' }}
                                    >
                                      {row.key}
                                    </TableCell>
                                    <TableCell align="right">
                                      {`${numberWithSpaces(row.value)} motes`}
                                    </TableCell>
                                  </TableRow>
                                </CsprTooltip>
                              ) : (
                                <Tooltip
                                  key={index}
                                  title={row.title ? row.title : ''}
                                  classes={{
                                    tooltip: this.props.classes.tooltip
                                  }}
                                  placement="top"
                                >
                                  <TableRow>
                                    <TableCell style={{ fontWeight: 'bold' }}>
                                      {row.key}
                                    </TableCell>
                                    <TableCell align="right">
                                      {isNaN(+row.value)
                                        ? row.value
                                        : numberWithSpaces(row.value)}
                                    </TableCell>
                                  </TableRow>
                                </Tooltip>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
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
                              {this.state.deploySpecificRows.map(
                                (row, index) => {
                                  return (
                                    <Tooltip
                                      key={index}
                                      title={row.title ? row.title : ''}
                                      classes={{
                                        tooltip: this.props.classes.tooltip
                                      }}
                                      placement="top"
                                    >
                                      <TableRow>
                                        <TableCell
                                          style={{ fontWeight: 'bold' }}
                                        >
                                          {row.key}
                                        </TableCell>
                                        <TableCell align="right">
                                          {isNaN(+row.value)
                                            ? Array.isArray(row.value)
                                              ? row.value.map(listItem => {
                                                  return (
                                                    <ul>
                                                      {!Array.isArray(
                                                        listItem
                                                      ) && listItem.length > 15
                                                        ? truncateString(
                                                            listItem,
                                                            6,
                                                            6
                                                          )
                                                        : listItem}
                                                    </ul>
                                                  );
                                                })
                                              : row.value
                                            : numberWithSpaces(row.value)}
                                        </TableCell>
                                      </TableRow>
                                    </Tooltip>
                                  );
                                }
                              )}
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
                  onClick={() => {
                    this.props.signingContainer.cancel(deployId!);
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={() =>
                    this.props.signingContainer
                      .signDeploy(deployId!)
                      .then(() => {
                        window.close();
                      })
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

export default withStyles(styles)(withRouter(SignDeployPage));
