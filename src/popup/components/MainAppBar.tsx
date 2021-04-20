import React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MoreMenu from './Menu';
import HomeIcon from '@material-ui/icons/Home';
import AccountManager from '../container/AccountManager';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import { observer } from 'mobx-react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Tooltip
} from '@material-ui/core';
import confirmConnect from './ConfirmConnect';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: 'white'
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
  authContainer: AccountManager;
  connectionContainer: ConnectSignerContainer;
}

export const MainAppBar = observer((props: Props) => {
  const classes = useStyles();
  const connected = props.connectionContainer.connectionStatus;

  if (props.authContainer.hasCreatedVault && props.authContainer.isUnLocked) {
    return (
      <React.Fragment>
        <AppBar
          position="static"
          className={classes.root}
          color={'transparent'}
        >
          <Toolbar>
            <IconButton edge="start" component={Link} to={'/'}>
              <HomeIcon />
            </IconButton>
            <Tooltip
              title={
                props.authContainer.userAccounts.length
                  ? 'Toggle Connection to Site'
                  : 'Add an Account to Connect'
              }
            >
              <span className={classes.toggleWrapper}>
                <Button
                  // Toggles connection status
                  className={classes.toggleButton}
                  disabled={!props.authContainer.userAccounts.length}
                  variant="outlined"
                  color={connected ? 'primary' : 'default'}
                  size="large"
                  onClick={() => {
                    if (connected) {
                      props.connectionContainer.disconnectFromSite();
                    } else {
                      confirmConnect().then(() => {
                        props.connectionContainer.connectToSite();
                      });
                    }
                  }}
                >
                  {connected ? 'Connected' : 'Disconnected'}
                </Button>
              </span>
            </Tooltip>
            <MoreMenu authContainer={props.authContainer} />
          </Toolbar>
        </AppBar>
        <div className={classes.toolbarMargin}></div>
      </React.Fragment>
    );
  } else {
    return <div className={classes.toolbarMargin}></div>;
  }
});
