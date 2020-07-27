import React, { Component } from 'react';
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
  Input
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
import AccountManager from '../container/AccountManager';
import { observer, Observer } from 'mobx-react';
import Dialog from '@material-ui/core/Dialog';

interface Item {
  id: string;
  primary: string;
  secondary?: string;
}

// a little function to help us with reordering the result
const reorder = (list: Item[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

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
  const [
    selectedAccount,
    setSelectedAccount
  ] = React.useState<SignKeyPairWithAlias | null>(null);
  const [name, setName] = React.useState('');

  const handleClickOpen = (account: SignKeyPairWithAlias) => {
    setOpenDialog(true);
    setSelectedAccount(account);
    setName(account.name);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedAccount(null);
  };

  const handleUpdateName = () => {
    if (selectedAccount) {
      props.authContainer.renameUserAccount(selectedAccount.name, name);
      handleClose();
    } else {
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
                                  props.authContainer.removeUserAccount(
                                    item.name
                                  );
                                }}
                              >
                                <DeleteIcon />
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
    </React.Fragment>
  );
});
