import React from 'react';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  ListSubheader,
  Typography,
  Tooltip
} from '@material-ui/core';
import RootRef from '@material-ui/core/RootRef';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import FilterNoneIcon from '@material-ui/icons/FilterNone'; // Used for Copy
import AccountManager from '../container/AccountManager';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import { observer, Observer } from 'mobx-react';
import { observable } from 'mobx';
import Dialog from '@material-ui/core/Dialog';
import { confirm } from './Confirmation';
import copy from 'copy-to-clipboard';
import { KeyPairWithAlias } from '../../@types/models';
import { CLPublicKey } from 'casper-js-sdk';
import { GetApp } from '@material-ui/icons';
import { TextFieldWithFormState } from './Forms';
import { RenameAccountFormData } from '../container/ImportAccountContainer';
import ErrorContainer from '../container/ErrorContainer';
import Pages from './Pages';

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: 'rgb(235,235,235)'
  })
});

interface Props extends RouteComponentProps {
  accountManager: AccountManager;
  connectionContainer: ConnectSignerContainer;
  errorsContainer: ErrorContainer;
}

interface State {
  openDialog: boolean;
  openKeyDialog: boolean;
  selectedAccount: KeyPairWithAlias | null;
  alias: string | null;
  publicKey: CLPublicKey | null;
  publicKeyHex: string | null;
  accountHash: string | null;
  copyStatus: boolean;
}

@observer
class AccountManagementPage extends React.Component<Props, State> {
  @observable renameAccountForm: RenameAccountFormData;

  constructor(props: Props) {
    super(props);
    const aliases = props.accountManager.userAccounts.map(account => {
      return account.alias;
    });
    this.renameAccountForm = new RenameAccountFormData(aliases);
    this.state = {
      openDialog: false,
      openKeyDialog: false,
      selectedAccount: null,
      alias: null,
      publicKey: null,
      publicKeyHex: null,
      accountHash: null,
      copyStatus: false
    };
  }

  handleClickOpen = (account: KeyPairWithAlias) => {
    this.setState({
      openDialog: true,
      selectedAccount: account,
      alias: account.alias
    });
  };

  handleViewKey = async (accountName: string) => {
    let hexKey = await this.props.accountManager.getPublicKeyHexByAlias(
      accountName
    );
    let hash = await this.props.accountManager.getAccountHashByAlias(
      accountName
    );
    this.setState({
      alias: accountName,
      publicKeyHex: hexKey,
      accountHash: hash,
      openKeyDialog: true
    });
  };

  handleDownloadKeys = async (alias: string) => {
    return await this.props.accountManager.downloadPemFiles(alias);
  };

  handleCopyMessage = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ copyStatus: false });
  };

  handleClose = () => {
    this.renameAccountForm.resetFields();
    this.setState({
      openDialog: false,
      openKeyDialog: false,
      selectedAccount: null
    });
  };

  handleUpdateName = () => {
    let account = this.state.selectedAccount;
    let alias = this.renameAccountForm.name.$;
    if (account && alias) {
      this.props.errorsContainer.capture(
        this.props.accountManager.renameUserAccount(account.alias, alias)
      );
      this.handleClose();
    }
  };

  onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    this.props.accountManager.reorderAccount(
      result.source.index,
      result.destination.index
    );
  };

  handleClickRemove = async (name: string) => {
    let backedUp = await this.props.accountManager.isBackedUp(name);
    !backedUp
      ? confirm(
          <div className="text-danger">Back up account</div>,
          <span>
            This account has not been backed up.
            <br />
            <b>
              You will not be able to recover this account without your key.
            </b>
            <br />
            <br />
            Would you like to download the key files for {name}?
          </span>,
          'Download',
          'Cancel',
          {}
        ).then(
          async () => await this.props.accountManager.downloadPemFiles(name)
        )
      : confirm(
          <div className="text-danger">Remove account</div>,
          <span>
            This account will be permanently deleted. Confirm password to remove
            account: <b>{name}</b>
          </span>,
          'Remove',
          'Cancel',
          {
            requirePassword: true,
            requireCheckbox: true,
            checkboxText:
              'I understand I will need the key files to recover this account'
          }
        ).then(
          async () => await this.props.accountManager.removeUserAccount(name)
        );
  };

  render() {
    return !this.props.accountManager.isUnLocked ||
      this.props.accountManager.userAccounts.length === 0 ? (
      <Redirect to={Pages.Home} />
    ) : (
      <React.Fragment>
        <DragDropContext onDragEnd={result => this.onDragEnd(result)}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <Observer>
                {() => (
                  // TODO: fix this (deprecated RootRef)
                  <RootRef rootRef={provided.innerRef}>
                    <List>
                      {this.props.accountManager.userAccounts.map(
                        (item, index) => (
                          <Draggable
                            key={item.alias}
                            draggableId={item.alias}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <ListItem
                                innerRef={provided.innerRef}
                                ContainerProps={{
                                  ...provided.draggableProps,
                                  ...provided.dragHandleProps,
                                  style: getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                  )
                                }}
                              >
                                <ListItemText primary={item.alias} />
                                <ListItemSecondaryAction>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      aria-label="Button will open a dialog to rename key"
                                      edge={'end'}
                                      onClick={() => {
                                        this.handleClickOpen(item);
                                      }}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      edge={'end'}
                                      onClick={() => {
                                        this.handleClickRemove(item.alias);
                                      }}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="View">
                                    <IconButton
                                      edge={'end'}
                                      onClick={() => {
                                        this.handleViewKey(item.alias);
                                      }}
                                    >
                                      <VpnKeyIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Download">
                                    <IconButton
                                      edge={'end'}
                                      onClick={() => {
                                        this.handleDownloadKeys(item.alias);
                                      }}
                                    >
                                      <GetApp />
                                    </IconButton>
                                  </Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            )}
                          </Draggable>
                        )
                      )}
                      {provided.placeholder}
                    </List>
                  </RootRef>
                )}
              </Observer>
            )}
          </Droppable>
        </DragDropContext>
        <Dialog
          open={this.state.openDialog}
          onClose={this.handleClose}
          aria-label="Form to rename account - focus will be given to name input field"
          aria-labelledby="form-dialog-title"
        >
          <form>
            <DialogTitle id="form-dialog-title">Rename</DialogTitle>
            <DialogContent>
              <TextFieldWithFormState
                autoFocus
                fullWidth
                label="Rename account"
                placeholder="Account alias"
                id="rename-account"
                fieldState={this.renameAccountForm.name}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={this.handleUpdateName}
                color="primary"
                disabled={this.renameAccountForm.submitDisabled}
              >
                Update
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog
          fullScreen
          open={this.state.openKeyDialog}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Account Details</DialogTitle>
          <DialogContent>
            <List>
              <ListSubheader>
                <Typography variant={'h6'}>{this.state.alias}</Typography>
              </ListSubheader>
              <ListItem>
                <IconButton
                  edge={'start'}
                  onClick={() => {
                    copy(this.state.publicKeyHex!);
                    this.setState({ copyStatus: true });
                  }}
                >
                  <FilterNoneIcon />
                </IconButton>
                <ListItemText
                  primary={`Public Key: ${this.state.publicKeyHex}`}
                  style={{ overflowWrap: 'break-word' }}
                />
              </ListItem>
              <ListItem>
                <IconButton
                  edge={'start'}
                  onClick={() => {
                    copy(this.state.accountHash!);
                    this.setState({ copyStatus: true });
                  }}
                >
                  <FilterNoneIcon />
                </IconButton>
                <ListItemText
                  primary={`Account Hash: ${this.state.accountHash}`}
                  style={{ overflowWrap: 'break-word' }}
                />
              </ListItem>
            </List>
            <Snackbar
              open={this.state.copyStatus}
              message="Copied!"
              autoHideDuration={1500}
              onClose={this.handleCopyMessage}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}
export default withRouter(AccountManagementPage);
