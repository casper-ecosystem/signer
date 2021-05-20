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
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
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
      'Are you sure you want to disconnect and remove this site?'
    ).then(() => props.connectionContainer.removeSite(name));
  };

  // TODO: Set types
  return (
    <List>
      {props.connectionContainer.connectedSites.map(
        (item: any, index: number) => {
          return (
            <ListItem>
              <ListItemText primary={item.url} />
              <ListItemSecondaryAction>
                <Tooltip title="Delete">
                  <IconButton
                    edge={'end'}
                    onClick={() => {
                      handleClickRemove(item.url);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                {item.isConnected ? (
                  <Tooltip title="Disconnect">
                    <IconButton
                      edge={'end'}
                      onClick={() => {
                        props.connectionContainer.disconnectFromSite(item.url);
                      }}
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Connect">
                    <IconButton
                      edge={'end'}
                      onClick={() => {
                        props.connectionContainer.connectToSite(item.url);
                      }}
                    >
                      <CheckCircleOutlineIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          );
        }
      )}
    </List>
  );
});
