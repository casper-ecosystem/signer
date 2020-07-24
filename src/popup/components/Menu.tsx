import React from 'react';
import AccountManager from '../container/AccountManager';
import { observer } from 'mobx-react';
import CheckIcon from '@material-ui/icons/Check';
import Icon from '@material-ui/core/Icon';
import Menu from '@material-ui/core/Menu';
import LockIcon from '@material-ui/icons/Lock';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { green } from '@material-ui/core/colors';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

interface Props {
  authContainer: AccountManager;
}

const MoreMenu = observer((props: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
          <ListItem
            dense={true}
            button
            onClick={() => {
              props.authContainer.downloadActiveKey();
            }}
          >
            <CloudDownloadIcon
              style={{ color: green[500], marginRight: '4px' }}
            />
            <ListItemText primary="Download active key" />
          </ListItem>
          <ListItem
            dense={true}
            button
            onClick={() => {
              props.authContainer.downloadActiveKey();
            }}
          >
            <CloudDownloadIcon
              style={{ color: green[500], marginRight: '4px' }}
            />
            <ListItemText primary="Download active key" />
          </ListItem>
          <ListItem
            dense={true}
            button
            onClick={() => {
              props.authContainer.lock();
            }}
          >
            <LockIcon style={{ color: green[500], marginRight: '4px' }} />
            <ListItemText primary="Lock" />
          </ListItem>
        </List>
      </Menu>
    </div>
  );
});

export default MoreMenu;
