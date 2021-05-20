import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
  Tooltip
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import AccountManager from '../container/AccountManager';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import { observer } from 'mobx-react';
import { confirm } from './Confirmation';

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
