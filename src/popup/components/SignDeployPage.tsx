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
// TODO: Move these to /shared/common
import {
  truncateString,
  numberWithSpaces,
  motesToCSPR
} from '../../background/utils';
import PopupContainer from '../container/PopupContainer';
import { isNumberish, isURefString } from '../../shared';

type RowValue = string | string[];

interface SigningDataRow {
  key: string;
  value: RowValue;
  tooltipContent?: string;
}

const truncationLengthCutoff = 13;
const isLongValue = (value: string) => {
  return (
    // Long enough to warrant truncating it
    value.length > truncationLengthCutoff
  );
};
const isCSPRValueByKey = (key: string) => {
  return ['Amount', 'Payment', 'Transaction Fee'].includes(key);
};
const shouldNotTruncate = (key: string) => {
  return ['Timestamp', 'Chain Name'].includes(key);
};

const signingTooltipFontSize = '.8rem';
const styles = () => ({
  tooltip: {
    fontSize: signingTooltipFontSize,
    textAlign: 'center' as const,
    margin: '10px 0 0 0',
    maxWidth: '300px',
    width: 'fit-content'
  },
  listItemTooltip: {
    fontSize: signingTooltipFontSize,
    textAlign: 'center' as const,
    marginRight: '60px'
  },
  csprToolTip: {
    fontSize: '.9rem',
    textAlign: 'center' as const,
    margin: '10px 0 0 0',
    width: 'fit-content'
  }
});

interface Props extends RouteComponentProps {
  signingContainer: SigningContainer;
  authContainer: AccountManager;
  popupContainer: PopupContainer;
  classes: Record<keyof ReturnType<typeof styles>, string>;
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
      const row = this.parseRow({ key, value });
      baseRows.push(row);
    }
    let argRows: SigningDataRow[] = [];
    for (let [key, value] of Object.entries(deployData.deployArgs)) {
      let row = this.parseRow({ key, value });
      argRows.push(row);
    }
    this.setState({
      genericRows: baseRows,
      deploySpecificRows: argRows,
      argsExpanded: argRows.length < 4
    });
  }

  parseRow(row: SigningDataRow): SigningDataRow {
    // Special case for items that should not be truncated for readability e.g. Timestamp
    if (shouldNotTruncate(row.key)) {
      return row;
    }
    // The value is a list e.g. a CLList or CLTuple
    if (Array.isArray(row.value)) {
      return row;
    }

    // The value is a stringified number e.g. an amount in motes
    if (isNumberish(row.value)) {
      // If the number is particularly long then truncate it
      const value = isLongValue(row.value)
        ? truncateString(row.value, 6, 6)
        : numberWithSpaces(row.value);

      // If the number represents Motes then display the CSPR value in the tooltip,
      // if it was truncated show the full number
      const tooltipContent = isCSPRValueByKey(row.key)
        ? `${motesToCSPR(row.value)} CSPR`
        : isLongValue(row.value)
        ? row.value
        : '';

      return {
        key: row.key,
        value,
        tooltipContent
      };
    }

    // The value is formatted string URef, due to the standard prefix and suffix we show more of the unique data
    if (isURefString(row.value)) {
      return {
        key: row.key,
        value: truncateString(row.value, 9, 9),
        tooltipContent: row.value
      };
    }

    // The value is a long string e.g. a key or hash
    if (isLongValue(row.value)) {
      return {
        key: row.key,
        value: truncateString(row.value, 6, 6),
        tooltipContent: row.value
      };
    }
    // For anything else return it as is
    return row;
  }

  createRowData(
    key: string,
    value: string | string[],
    tooltipContent?: string
  ): SigningDataRow {
    return { key, value, tooltipContent };
  }

  createTooltippedRow(row: SigningDataRow) {
    const isMotesValue = isCSPRValueByKey(row.key);
    return (
      <Tooltip
        title={row.tooltipContent ?? ''}
        placement="top"
        classes={{
          tooltip: isMotesValue
            ? this.props.classes.csprToolTip
            : this.props.classes.tooltip
        }}
      >
        <TableRow>
          <TableCell style={{ fontWeight: 'bold' }}>{row.key}</TableCell>
          <TableCell align="right">
            {
              /**
               * Checks if the string represents a list so it can be displayed properly
               */
              Array.isArray(row.value) ? (
                <ul style={{ listStyleType: 'none' }}>
                  {row.value.map(item => {
                    {
                      /* 
                        Utilises the parseRow method to properly parse the inner value and then display it
                      */
                    }
                    return this.createTooltippedListItem(
                      this.parseRow({ key: row.key, value: item })
                    );
                  })}
                </ul>
              ) : (
                row.value
              )
            }
          </TableCell>
        </TableRow>
      </Tooltip>
    );
  }

  createTooltippedListItem(row: SigningDataRow) {
    return (
      <Tooltip
        title={row.tooltipContent ?? ''}
        placement="top"
        classes={{ tooltip: this.props.classes.listItemTooltip }}
      >
        <li>{row.value}</li>
      </Tooltip>
    );
  }

  render() {
    if (this.state.deployToSign && this.props.authContainer.isUnLocked) {
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
                {this.state.genericRows.map((row: SigningDataRow) => {
                  // If the row displays Motes use the CSPR specific tooltip styling
                  return this.createTooltippedRow(row);
                })}
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
                            {this.state.deploySpecificRows.map(row => {
                              return this.createTooltippedRow(row);
                            })}
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
                              {this.state.deploySpecificRows.map(row => {
                                return this.createTooltippedRow(row);
                              })}
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
                    this.props.signingContainer.cancel(deployId!).then(() => {
                      this.props.popupContainer.callClosePopup();
                    });
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
                        this.props.popupContainer.callClosePopup();
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
