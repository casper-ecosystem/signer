import React from 'react';
import AccountManager from '../container/AccountManager';
import { observer } from 'mobx-react';
import SettingsIcon from '@material-ui/icons/Settings';
import CheckIcon from '@material-ui/icons/Check';
import Icon from '@material-ui/core/Icon';
import Menu from '@material-ui/core/Menu';
import LockIcon from '@material-ui/icons/Lock';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Pages from './Pages';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { Link } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

interface Props {
  authContainer: AccountManager;
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
    setAnchorEl(event.currentTarget);
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
              Accounts
            </ListSubheader>
          }
        >
          {props.authContainer.userAccounts.map((account, i) => {
            return (
              <ListItem
                key={i}
                button
                dense={true}
                onClick={() => {
                  props.authContainer.switchToAccount(account.name);
                  handleClose();
                }}
              >
                {account.name ===
                props.authContainer.selectedUserAccount?.name ? (
                  <CheckIcon fontSize={'small'} />
                ) : (
                  <Icon className={'fa fa-fw'} fontSize={'small'} />
                )}
                <ListItemText primary={account.name} />
              </ListItem>
            );
          })}
          <Divider light />
          {props.authContainer.userAccounts.length > 0 && (
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
          {props.authContainer.selectedUserAccount && (
            <ListItem
              dense={true}
              button
              onClick={() => {
                props.authContainer.downloadActiveKey();
                handleClose();
              }}
            >
              <CloudDownloadIcon className={classes.menuIcon} />
              <ListItemText primary="Download Active Key" />
            </ListItem>
          )}
          <ListItem
            dense={true}
            button
            onClick={() => {
              props.authContainer.lock();
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
