import { Dropdown } from 'react-bootstrap';
import React from 'react';
import Pages from './Pages';
import AccountManager from '../container/AccountManager';
import { observer } from 'mobx-react';
import { Icon } from './Utils';

interface Props {
  authContainer: AccountManager;
}

type ButtonProps = React.HTMLProps<HTMLButtonElement>;

// The forwardRef is important!!
// Dropdown needs access to the DOM node in order to position the Menu
const CustomToggle = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, onClick }, ref) => (
    <button
      ref={ref}
      onClick={e => {
        e.preventDefault();
        onClick && onClick(e);
      }}
      title={'menu'}
      style={{ fontSize: 20 }}
      className="link icon-button"
    >
      {children}
      <Icon name="bars"></Icon>
    </button>
  )
);

@observer
export default class Menu extends React.Component<Props, any> {
  render() {
    return (
      this.props.authContainer.hasCreatedVault &&
      this.props.authContainer.isUnLocked && (
        <div id="top-right-menu">
          <Dropdown alignRight={true}>
            <Dropdown.Toggle id="dropdown-basic" as={CustomToggle} />
            <Dropdown.Menu>
              <Dropdown.Header>Accounts</Dropdown.Header>
              {this.props.authContainer.userAccounts.map((account, i) => {
                return (
                  <Dropdown.Item
                    key={i}
                    onClick={() => {
                      this.props.authContainer.switchToAccount(account.name);
                    }}
                  >
                    {account.name ===
                    this.props.authContainer.selectedUserAccount?.name ? (
                      <Icon name={'check'} fontSize={12} />
                    ) : (
                      <i style={{ fontSize: 12 }} className={'fa fa-fw'} />
                    )}
                    {account.name}
                  </Dropdown.Item>
                );
              })}
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => {
                  this.props.authContainer.lock();
                }}
              >
                <Icon name={'lock'} color={'green'} /> Lock
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )
    );
  }
}
