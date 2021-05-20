import React from 'react';
import { useHistory } from 'react-router-dom';
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
  Input,
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
import { toJS } from 'mobx';
import Dialog from '@material-ui/core/Dialog';
import { confirm } from './Confirmation';
import copy from 'copy-to-clipboard';
import Pages from './Pages';
import { decodeBase64, encodeBase16, Keys, PublicKey } from 'casper-client-sdk';

// interface Item {
//   id: string;
//   primary: string;
//   secondary?: string;
// }

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: 'rgb(235,235,235)'
  })
});

interface Props {
  authContainer: AccountManager;
  connectionContainer: ConnectSignerContainer;
}

export const AccountManagementPage = observer((props: Props) => {
  const history = useHistory();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openKeyDialog, setOpenKeyDialog] = React.useState(false);
  const [
    selectedAccount,
    setSelectedAccount
  ] = React.useState<SignKeyPairWithAlias | null>(null);
  const [name, setName] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState(false);
  const [publicKey64, setPublicKey64] = React.useState('');

  // Currently only supports ED25519 keys will soon be extended to support SECP256k1 keys.
  const publicKey = PublicKey.from(
    decodeBase64(publicKey64),
    Keys.SignatureAlgorithm.Ed25519
  );
  const accountHash = encodeBase16(publicKey.toAccountHash());

  const handleClickOpen = (account: SignKeyPairWithAlias) => {
    setOpenDialog(true);
    setSelectedAccount(account);
    setName(account.name);
  };

  const handleViewKey = async (accountName: string) => {
    let publicKey64 = await props.authContainer.getSelectedAccountKey(
      accountName
    );
    setName(accountName);
    setPublicKey64(publicKey64);
    setOpenKeyDialog(true);
  };

  const handleCopyMessage = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setCopyStatus(false);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setOpenKeyDialog(false);
    setSelectedAccount(null);
  };

  const handleUpdateName = () => {
    if (selectedAccount) {
      props.authContainer.renameUserAccount(selectedAccount.name, name);
      props.authContainer.switchToAccount(name);
      handleClose();
    }
  };

  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    props.authContainer.reorderAccount(
      result.source.index,
      result.destination.index
    );
  };

  const handleClickRemove = (name: string) => {
    confirm(
      <div className="text-danger">Remove account</div>,
      'Are you sure you want to remove this account?'
    )
      .then(() => props.authContainer.removeUserAccount(name))
      .then(async () => {
        // If there are no users accounts left after deletion then
        // disconnect from the site and
        // redirect to the home screen
        if (!(props.authContainer.userAccounts.length > 0)) {
          await props.connectionContainer.disconnectFromSite();
          history.push(Pages.Home);
        }
      });
  };

  console.log('!', toJS(props.connectionContainer));

  return (
    <React.Fragment>
      <DragDropContext onDragEnd={result => onDragEnd(result)}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <Observer>
              {() => (
                <RootRef rootRef={provided.innerRef}>
                  <List>
                    {props.authContainer.userAccounts.map((item, index) => (
                      <Draggable
                        key={item.name}
                        draggableId={item.name}
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
                            <ListItemText primary={item.name} />
                            <ListItemSecondaryAction>
                              <Tooltip title="Edit">
                                <IconButton
                                  aria-label="Button will open a dialog to rename key"
                                  edge={'end'}
                                  onClick={() => {
                                    handleClickOpen(item);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {props.authContainer.userAccounts.length > 1 ? (
                                <Tooltip title="Delete">
                                  <IconButton
                                    edge={'end'}
                                    onClick={() => {
                                      handleClickRemove(item.name);
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                // span is required for tooltip to work on disabled button
                                <Tooltip title="Can't delete only account">
                                  <span>
                                    <IconButton edge={'end'} disabled>
                                      <DeleteIcon />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              )}
                              <Tooltip title="View">
                                <IconButton
                                  edge={'end'}
                                  onClick={() => {
                                    handleViewKey(item.name);
                                  }}
                                >
                                  <VpnKeyIcon />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                </RootRef>
              )}
            </Observer>
          )}
        </Droppable>
      </DragDropContext>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-label="Form to rename account - focus will be given to name input field"
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Rename</DialogTitle>
        <DialogContent>
          <Input
            autoFocus
            margin="dense"
            id="name"
            type="text"
            fullWidth
            value={name}
            onChange={e => {
              setName(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateName} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        open={openKeyDialog}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Account Details</DialogTitle>
        <DialogContent>
          <List>
            <ListSubheader>
              <Typography variant={'h6'}>{name}</Typography>
            </ListSubheader>
            <ListItem>
              <IconButton
                edge={'start'}
                onClick={() => {
                  copy(publicKey.toAccountHex());
                  setCopyStatus(true);
                }}
              >
                <FilterNoneIcon />
              </IconButton>
              <ListItemText
                primary={'Public Key: ' + publicKey.toAccountHex()}
                style={{ overflowWrap: 'break-word' }}
              />
            </ListItem>
            <ListItem>
              <IconButton
                edge={'start'}
                onClick={() => {
                  copy(accountHash);
                  setCopyStatus(true);
                }}
              >
                <FilterNoneIcon />
              </IconButton>
              <ListItemText
                primary={'Account Hash: ' + accountHash}
                style={{ overflowWrap: 'break-word' }}
              />
            </ListItem>
          </List>
          <Snackbar
            open={copyStatus}
            message="Copied!"
            autoHideDuration={1500}
            onClose={handleCopyMessage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
});
