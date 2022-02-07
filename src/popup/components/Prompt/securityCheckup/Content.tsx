import React from 'react';
import {
  DialogContent,
  DialogContentText,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip
} from '@material-ui/core';

import AccountManager from '../../../container/AccountManager';
import { GetApp } from '@material-ui/icons';

interface Props {
  authContainer: AccountManager;
  isInitialPageShown: boolean;
  setIsInitialPageShown: (value: boolean) => void;
}

export function Content({
  authContainer,
  isInitialPageShown,
  setIsInitialPageShown
}: Props): JSX.Element {
  if (!isInitialPageShown) {
    return (
      <DialogContent>
        <DialogContentText>
          <List className="prompt-account-list">
            {authContainer &&
              authContainer.userAccounts &&
              authContainer.userAccounts.map((account, index) => (
                <ListItem>
                  <ListItemText primary={account.alias} />
                  <ListItemSecondaryAction>
                    <Tooltip title="Download">
                      <IconButton
                        edge={'end'}
                        onClick={() => {
                          authContainer.downloadPemFiles(account.alias);
                        }}
                      >
                        <GetApp />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </DialogContentText>
      </DialogContent>
    );
  }

  const nextPageHandler = () => setIsInitialPageShown(false);

  return (
    <DialogContent>
      <DialogContentText>
        <p>
          Each of your accounts has a corresponding Secret Key file that
          provides access to the funds on that account.
        </p>
        <ul className="prompt-content-list">
          <li>
            Make sure that you have downloaded and backed up each Secret Key
            file.{' '}
            <Link
              className="start-here-button"
              component="button"
              onClick={nextPageHandler}
            >
              Start here
            </Link>
          </li>
          <li>Never share your Secret Key file with anyone.</li>
          <li>
            The Casper Signer Team will never ask for your Secret Key file.
          </li>
        </ul>
      </DialogContentText>
    </DialogContent>
  );
}