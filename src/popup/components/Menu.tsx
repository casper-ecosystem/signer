import React from 'react';
import { observer } from 'mobx-react';
import Pages from './Pages';
import { Link } from 'react-router-dom';
import AccountManager from '../container/AccountManager';
import {
  Settings as SettingsIcon,
  Check as CheckIcon,
  Lock as LockIcon,
  CloudDownload as CloudDownloadIcon,
  Web as WebIcon,
  Menu as MenuIcon,
  Timer as TimerIcon
} from '@material-ui/icons';
import {
  Icon,
  IconButton,
  Menu,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Divider,
  Typography
} from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

interface Props {
  accountManager: AccountManager;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuIcon: { color: 'green', marginRight: '0.2rem' }
  })
);

const MoreMenu = observer((props: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const classes = useStyles();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setTimeout(() => {
      setAnchorEl(null);
    }, 200);
  };

  return (
    <div>
      <IconButton
        edge="end"
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        style={{ color: '#C4C4C4' }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id={'simple-menu'}
        anchorEl={anchorEl}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <List
          aria-labelledby="nested-list-subheader"
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              {props.accountManager.userAccounts.length > 0
                ? 'Accounts'
                : 'No Account'}
            </ListSubheader>
          }
        >
          {props.accountManager.userAccounts.map((account, i) => {
            return (
              <ListItem
                key={i}
                button
                dense={true}
                onClick={() => {
                  props.accountManager.switchToAccount(account.alias);
                  handleClose();
                }}
              >
                {account.alias ===
                props.accountManager.activeUserAccount?.alias ? (
                  <CheckIcon fontSize={'small'} />
                ) : (
                  <Icon className={'fa fa-fw'} fontSize={'small'} />
                )}
                <ListItemText primary={account.alias} />
              </ListItem>
            );
          })}
          <Divider light />
          {props.accountManager.userAccounts.length > 0 && (
            <ListItem
              dense={true}
              component={Link}
              to={Pages.AccountManagement}
              button
              onClick={handleClose}
            >
              <SettingsIcon className={classes.menuIcon} />
              <ListItemText primary="Key Management" />
            </ListItem>
          )}
          <ListItem
            dense={true}
            component={Link}
            to={Pages.ConnectedSites}
            button
            onClick={handleClose}
          >
            <WebIcon className={classes.menuIcon} />
            <ListItemText primary="Connected Sites" />
          </ListItem>
          {props.accountManager.activeUserAccount && (
            <ListItem
              dense={true}
              button
              onClick={() => {
                props.accountManager.downloadActiveKey();
                handleClose();
              }}
            >
              <CloudDownloadIcon className={classes.menuIcon} />
              <ListItemText primary="Download Active Key" />
            </ListItem>
          )}
          <ListItem
            dense={true}
            component={Link}
            to={Pages.ConfigureTimeout}
            button
            onClick={handleClose}
          >
            <TimerIcon className={classes.menuIcon} />
            <ListItemText primary="Timeout" />
            <Typography variant="overline">
              {props.accountManager.idleTimeoutMins} min
              {props.accountManager.idleTimeoutMins === 1 ? '' : 's'}
            </Typography>
          </ListItem>
          <ListItem
            dense={true}
            button
            onClick={() => {
              props.accountManager.lock();
              handleClose();
            }}
          >
            <LockIcon className={classes.menuIcon} />
            <ListItemText primary="Lock" />
          </ListItem>
        </List>
      </Menu>
    </div>
  );
});

export default MoreMenu;
