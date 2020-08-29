import React from 'react';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MoreMenu from './Menu';
import HomeIcon from '@material-ui/icons/Home';
import AccountManager from '../container/AccountManager';
import { observer } from 'mobx-react';
import IconButton from '@material-ui/core/IconButton';

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
}

export const MainAppBar = observer((props: Props) => {
  const classes = useStyles();

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
            <Typography variant="h6" className={classes.title}></Typography>
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
