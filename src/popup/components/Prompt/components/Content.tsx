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
  Tooltip,
  makeStyles
} from '@material-ui/core';
import { GetApp } from '@material-ui/icons';

import AccountManager from '../../../container/AccountManager';

const styles = {
  MuiDialogContent: {
    padding: '4px 10px'
  },
  MuiTypography: {
    fontSize: '14px',
    marginBlockEnd: '7px'
  },
  MuiList: {
    marginBottom: '30px',
    paddingTop: '0'
  },
  MuiListItem: {
    paddingTop: '0',
    paddingBottom: '0'
  },
  MuiListItemText: {
    fontSize: '14px',
    marginTop: '6px',
    marginBottom: '6px'
  },
  MuiLink: {
    color: '#e6332a',
    lineHeight: '0'
  },
  list: {
    marginTop: '8px',
    paddingLeft: '18px',
    marginBlockStart: '0',
    marginBlockEnd: '0'
  },
  paragraph: {
    marginTop: '8px',
    marginBlockEnd: '0'
  }
};

const useStyles = makeStyles(styles);

interface Props {
  authContainer: AccountManager;
  isOnInitialScreen: boolean;
  setIsInitialPageShown: (value: boolean) => void;
}

export function Content({
  authContainer,
  isOnInitialScreen,
  setIsInitialPageShown
}: Props): JSX.Element {
  const classes = useStyles();

  if (!isOnInitialScreen) {
    return (
      <DialogContent classes={{ root: classes.MuiDialogContent }}>
        <DialogContentText classes={{ root: classes.MuiTypography }}>
          <List classes={{ root: classes.MuiList }}>
            {authContainer &&
              authContainer.userAccounts &&
              authContainer.userAccounts.map((account, index) => (
                <ListItem classes={{ root: classes.MuiListItem }}>
                  <ListItemText
                    classes={{ primary: classes.MuiListItemText }}
                    primary={account.alias}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Download">
                      <IconButton
                        edge="end"
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
    <DialogContent classes={{ root: classes.MuiDialogContent }}>
      <DialogContentText classes={{ root: classes.MuiTypography }}>
        <p className={classes.paragraph}>
          Each of your accounts has a corresponding Secret Key file that
          provides access to the funds on that account.
        </p>
        <ul className={classes.list}>
          <li>
            Make sure that you have downloaded and backed up each Secret Key
            file <b>securely</b>.{' '}
            <Link
              classes={{ root: classes.MuiLink }}
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
