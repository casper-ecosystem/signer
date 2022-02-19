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
import { makeStyles } from '@material-ui/core/styles';

const pageOneStyles = {
  link: {
    color: '#e6332a',
    lineHeight: '0'
  },

  descriptionList: {
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

const usePageOneStyles = makeStyles(pageOneStyles);

interface ContentPageOneProps {
  setSecurityCheckupPageIndex: (page: number) => void;
}

export function ContentPageOne({
  setSecurityCheckupPageIndex
}: ContentPageOneProps) {
  const classes = usePageOneStyles();

  return (
    <>
      <p className={classes.paragraph}>
        Each of your accounts has a corresponding Secret Key file that provides
        access to the funds on that account.
      </p>
      <ul className={classes.descriptionList}>
        <li>
          Make sure that you have downloaded and backed up each Secret Key file{' '}
          <b>securely</b>.{' '}
          <Link
            classes={{ root: classes.link }}
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

const pageTwoStyles = {
  keysList: {
    marginBottom: '30px',
    paddingTop: '0'
  },

  keysListItem: {
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '8px'
  },

  keysListItemText: {
    marginTop: '6px',
    marginBottom: '6px',
    paddingTop: '0',

    '& .MuiTypography-body1': {
      fontSize: '14px'
    }
  }
};
const usePageTwoStyles = makeStyles(pageTwoStyles);

interface ContentPageTwoProps {
  accountManager: AccountManager;
}

export function ContentPageTwo({ accountManager }: ContentPageTwoProps) {
  const classes = usePageTwoStyles();

  return (
    <List classes={{ root: classes.keysList }}>
      {accountManager &&
        accountManager.userAccounts &&
        accountManager.userAccounts.map((account, index) => (
          <ListItem classes={{ root: classes.keysListItem }}>
            <ListItemText
              classes={{ root: classes.keysListItemText }}
              primary={account.alias}
            />
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
