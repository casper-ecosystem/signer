import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AccountManager from '../container/AccountManager';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import { observer } from 'mobx-react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100vw',
      flexGrow: 1,
      color: '#c4c4c4',
      backgroundColor: 'var(--cspr-dark-blue)'
    },
    toolbarMargin: {
      minHeight: '40px'
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    toggleWrapper: {
      flexGrow: 1,
      textAlign: 'center'
    },
    toggleButton: {
      width: '100%',
      height: '2rem'
    }
  })
);

interface Props {
  accountManager: AccountManager;
  connectionContainer: ConnectSignerContainer;
}

export const MainAppBar = observer((props: Props) => {
  const classes = useStyles();

  return <div className={classes.toolbarMargin}></div>;
});
