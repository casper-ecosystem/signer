import React from 'react';
import AccountManager from '../../../../container/AccountManager';
import {
  IconButton,
  Link,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Tooltip
} from '@material-ui/core';
import { GetApp } from '@material-ui/icons';

interface ContentPageOneProps {
  setSecurityCheckupPageIndex: (page: number) => void;
}

export function ContentPageOne({
  setSecurityCheckupPageIndex
}: ContentPageOneProps) {
  return (
    <>
      <p>
        Each of your accounts has a corresponding Secret Key file that provides
        access to the funds on that account.
      </p>
      <ul>
        <li>
          Make sure that you have downloaded and backed up each Secret Key file{' '}
          <b>securely</b>.{' '}
          <Link
            component="button"
            onClick={() => setSecurityCheckupPageIndex(1)}
          >
            Start here
          </Link>
        </li>
        <li>Never share your Secret Key file with anyone.</li>
        <li>The Casper Signer Team will never ask for your Secret Key file.</li>
      </ul>
    </>
  );
}

interface ContentPageTwoProps {
  accountManager: AccountManager;
}

export function ContentPageTwo({ accountManager }: ContentPageTwoProps) {
  return (
    <List>
      {accountManager &&
        accountManager.userAccounts &&
        accountManager.userAccounts.map((account, index) => (
          <ListItem>
            <ListItemText primary={account.alias} />
            <ListItemSecondaryAction>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  onClick={() => {
                    accountManager.downloadPemFiles(account.alias);
                  }}
                >
                  <GetApp />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
    </List>
  );
}
