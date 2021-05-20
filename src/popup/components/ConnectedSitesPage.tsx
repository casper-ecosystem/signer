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
  connectionContainer: ConnectSignerContainer;
}

export const ConnectedSitesPage = observer((props: Props) => {
  console.log(
    toJS(props.connectionContainer),
    toJS(props.connectionContainer.connectedSites)
  );
  return (
    <div>
      {props.connectionContainer.connectedSites.map(site => (
        <ListItem>
          <ListItemText primary={site} />
          <ListItemSecondaryAction>
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
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </div>
  );
});
