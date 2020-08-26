import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MoreMenu from './Menu';
import AccountManager from '../container/AccountManager';
import { observer } from 'mobx-react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1
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
  console.log(props.authContainer.hasCreatedVault);
  console.log(props.authContainer.isUnLocked);

  if (props.authContainer.hasCreatedVault && props.authContainer.isUnLocked) {
    return (
      <React.Fragment>
        <AppBar
          position="static"
          className={classes.root}
          color={'transparent'}
        >
          <Toolbar>
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
