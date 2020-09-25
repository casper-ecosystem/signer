import React from 'react';
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
  Typography
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
import { observer, Observer } from 'mobx-react';
import Dialog from '@material-ui/core/Dialog';
import { confirm } from './Confirmation';
import copy from 'copy-to-clipboard';

interface Item {
  id: string;
  primary: string;
  secondary?: string;
}

const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // styles we need to apply on draggables
  ...draggableStyle,

  ...(isDragging && {
    background: 'rgb(235,235,235)'
  })
});

interface Props {
  authContainer: AccountManager;
}

export const AccountManagementPage = observer((props: Props) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [openKeyDialog, setOpenKeyDialog] = React.useState(false);
  const [
    selectedAccount,
    setSelectedAccount
  ] = React.useState<SignKeyPairWithAlias | null>(null);
  const [name, setName] = React.useState('');
  const [publicKey64, setPublicKey64] = React.useState('');
  const [publicKeyHex, setPublicKeyHex] = React.useState('');
  /* Note: 01 prefix denotes algorithm used in key generation */
  const address = '01' + publicKeyHex;
  const [copyStatus, setCopyStatus] = React.useState(false);

  const handleClickOpen = (account: SignKeyPairWithAlias) => {
    setOpenDialog(true);
    setSelectedAccount(account);
    setName(account.name);
  };

  const handleViewKey = async (accountName: string) => {
    let publicKey64 = await props.authContainer.getSelectedAccountKey(
      accountName
    );
    let publicKeyHex = await props.authContainer.getPublicKeyHex(accountName);
    setName(accountName);
    setPublicKey64(publicKey64);
    setPublicKeyHex(publicKeyHex);
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
    ).then(() => props.authContainer.removeUserAccount(name));
  };

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
                              <IconButton
                                edge={'end'}
                                onClick={() => {
                                  handleClickOpen(item);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                edge={'end'}
                                onClick={() => {
                                  handleClickRemove(item.name);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                              <IconButton
                                edge={'end'}
                                onClick={() => {
                                  handleViewKey(item.name);
                                }}
                              >
                                <VpnKeyIcon />
                              </IconButton>
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
                  copy(address);
                  setCopyStatus(true);
                }}
              >
                <FilterNoneIcon />
              </IconButton>
              <ListItemText
                primary={'Address: ' + address}
                style={{ overflowWrap: 'break-word' }}
              />
            </ListItem>
            <ListItem>
              <IconButton
                edge={'start'}
                onClick={() => {
                  copy(publicKey64);
                  setCopyStatus(true);
                }}
              >
                <FilterNoneIcon />
              </IconButton>
              <ListItemText
                primary={'Public Key: ' + publicKey64}
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
