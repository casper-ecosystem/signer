import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemSecondaryAction,
  Tooltip,
  Typography
} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import AccountManager from '../container/AccountManager';
import { observer } from 'mobx-react';
import { confirm } from './Confirmation';
import { Redirect } from 'react-router-dom';
import Pages from './Pages';

interface Props {
  connectionContainer: ConnectSignerContainer;
  accountManager: AccountManager;
}

export const ConnectedSitesPage = observer((props: Props) => {
  const handleClickRemove = (name: string) => {
    confirm(
      <div className="text-danger">Remove Site</div>,
      'Are you sure you want to disconnect and remove this site?'
    ).then(() => props.connectionContainer.removeSite(name));
  };

  return !props.accountManager.isUnLocked ? (
    <Redirect to={Pages.Home} />
  ) : props.connectionContainer.connectedSites[0] ? (
    <List>
      {props.connectionContainer.connectedSites.map((item, index) => {
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
      })}
    </List>
  ) : (
    <Typography variant="h5">No Saved Sites</Typography>
  );
});
