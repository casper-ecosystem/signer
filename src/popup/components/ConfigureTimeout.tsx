import React from 'react';
import AccountManager from '../container/AccountManager';
import Pages from '../components/Pages';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography
} from '@material-ui/core';
import { Brightness1 as ActiveIcon } from '@material-ui/icons';
import { observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';

export const ConfigureTimeoutPage = observer(
  (props: { accountManager: AccountManager }) => {
    return props.accountManager.isUnLocked ? (
      <div>
        <h2>Set Idle Timeout</h2>
        <Typography>
          Select how long you'd like before the Signer locks due to inactivity.
        </Typography>
        <List>
          <ListItem
            button={true}
            onClick={async () => {
              await props.accountManager.configureTimeout(1);
            }}
          >
            <ListItemText primary="1 minute" />
            {1 === props.accountManager.idleTimeoutMins && (
              <ListItemIcon>
                <ActiveIcon style={{ color: 'green', marginLeft: '30px' }} />
              </ListItemIcon>
            )}
          </ListItem>
          <ListItem
            button={true}
            onClick={async () => {
              await props.accountManager.configureTimeout(2);
            }}
          >
            <ListItemText primary="2 minutes" />
            {2 === props.accountManager.idleTimeoutMins && (
              <ListItemIcon>
                <ActiveIcon style={{ color: 'green', marginLeft: '30px' }} />
              </ListItemIcon>
            )}
          </ListItem>
          <ListItem
            button={true}
            onClick={async () => {
              await props.accountManager.configureTimeout(5);
            }}
          >
            <ListItemText primary="5 minutes" />
            {5 === props.accountManager.idleTimeoutMins && (
              <ListItemIcon>
                <ActiveIcon style={{ color: 'green', marginLeft: '30px' }} />
              </ListItemIcon>
            )}
          </ListItem>
          <ListItem
            button={true}
            onClick={async () => {
              await props.accountManager.configureTimeout(10);
            }}
          >
            <ListItemText primary="10 minutes" />
            {10 === props.accountManager.idleTimeoutMins && (
              <ListItemIcon>
                <ActiveIcon style={{ color: 'green', marginLeft: '30px' }} />
              </ListItemIcon>
            )}
          </ListItem>
        </List>
      </div>
    ) : (
      <Redirect to={Pages.Home} />
    );
  }
);
