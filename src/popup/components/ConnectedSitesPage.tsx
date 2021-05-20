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

interface Props {
  authContainer: AccountManager;
  connectionContainer: ConnectSignerContainer;
}

export const ConnectedSitesPage = observer((props: Props) => {
  const handleClickRemove = (name: string) => {
    confirm(
      <div className="text-danger">Remove Site</div>,
      'Are you sure you want to remove this Site?'
    ).then(() => props.connectionContainer.disconnectFromSite(name));
  };

  return (
    <List>
      {props.connectionContainer.connectedSites.map(
        (item: string, index: number) => (
          <ListItem>
            <ListItemText primary={item} />
            <ListItemSecondaryAction>
              <Tooltip title="Delete">
                <IconButton
                  edge={'end'}
                  onClick={() => {
                    handleClickRemove(item);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        )
      )}
    </List>
  );
});
