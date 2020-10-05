import React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import MoreMenu from './Menu';
import HomeIcon from '@material-ui/icons/Home';
import AccountManager from '../container/AccountManager';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import { observer } from 'mobx-react';
import { AppBar, Toolbar, IconButton, Button } from '@material-ui/core';

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
    title: {
      flexGrow: 1
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
            <Button
              // Toggles connection status
              variant="outlined"
              className={classes.title}
              color={connected ? 'primary' : 'default'}
              size="small"
              onClick={() => {
                if (connected) {
                  props.connectionContainer.disconnectFromSite();
                } else {
                  props.connectionContainer.connectToSite();
                }
              }}
            >
              {connected ? 'Connected' : 'Disconnected'}
            </Button>
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
