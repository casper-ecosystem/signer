import React from 'react';
import logo from '../img/CasperLabs_Logo_Favicon_RGB_50px.png';
import casperWalletBanner from '../img/Casper_Wallet_Banner.png';
import {
  Button,
  createStyles,
  FormControl,
  Theme,
  WithStyles,
  Typography,
  withStyles,
  Grid,
  // Popover,
  // IconButton,
  Link
} from '@material-ui/core';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
// import HelpIcon from '@material-ui/icons/Help';
// import { Redirect, Link as L } from 'react-router-dom';
import AccountManager from '../container/AccountManager';
import PopupContainer from '../container/PopupContainer';
import { HomeContainer } from '../container/HomeContainer';
import ConnectSignerContainer from '../container/ConnectSignerContainer';
import ErrorContainer from '../container/ErrorContainer';
import { observer } from 'mobx-react';
// import Pages from './Pages';
// import { confirm } from './Confirmation';
import { RouteComponentProps, withRouter } from 'react-router';
import { TextFieldWithFormState } from './Forms';
import SigningContainer from '../container/SigningContainer';
// import { SignMessagePage } from './SignMessagePage';
// import { PurposeForOpening } from '../../shared';

/* eslint-disable jsx-a11y/anchor-is-valid */
const styles = (theme: Theme) =>
  createStyles({
    margin: {
      marginTop: '20px'
    },
    alignCenter: {
      textAlign: 'center'
    },
    unlockButton: {
      backgroundColor: 'var(--cspr-dark-blue)',
      color: 'white',
      '&$disabled': {
        backgroundColor: 'white',
        color: 'grey'
      }
    },
    disabled: {},
    lockout: {
      position: 'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      background:
        'linear-gradient(30deg, var(--cspr-dark-blue) 50%, var(--cspr-red) 100%)',
      padding: '2em',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'snow',
      textAlign: 'center',
      '& > *': {
        marginBottom: '1rem'
      },
      '& > :nth-child(2)': {
        fontSize: '1.2rem'
      }
    }
  });

interface Props extends RouteComponentProps, WithStyles<typeof styles> {
  accountManager: AccountManager;
  homeContainer: HomeContainer;
  connectionContainer: ConnectSignerContainer;
  signingContainer: SigningContainer;
  popupContainer: PopupContainer;
  errors: ErrorContainer;
}

@observer
class Home extends React.Component<
  Props,
  { remainingMins: number; helpAnchorEl: HTMLButtonElement | null }
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      remainingMins: this.props.accountManager.remainingMins,
      helpAnchorEl: null
    };
  }
  // NOT USING THIS JUST NOW - BUT LEFT IT HERE IN CASE WE COME BACK TO USE THIS KIND OF METHOD
  //
  // componentDidMount() {
  //   setTimeout(() => this.sessionTimeout(), 0.2 * 60 * 1000);
  // }

  // sessionTimeout() {
  //   confirm(
  //     'Are you there?',
  //     'Your session is about to lock, would you like to keep it open?',
  //     'Keep open',
  //     'Lock',
  //     { unmountAfter: 1000 }
  //   ).then(
  //     () => {
  //       console.log('Keep open');
  //       // Keep open - ask again in another X minutes
  //       setTimeout(() => this.sessionTimeout(), 0.2 * 60 * 1000);
  //     },
  //     () => {
  //       console.log('Lock');
  //       // Lock
  //       this.props.authContainer.lock();
  //     }
  //   );
  // }

  componentDidUpdate() {
    if (this.props.accountManager.isLockedOut) {
      this.props.errors.dismissLast();
      this.props.homeContainer.homeForm.$.setPasswordField.reset();
    }
  }

  renderCreateNewVault() {
    // const showPasswordHelp = (event: React.MouseEvent<HTMLButtonElement>) => {
    //   this.setState({ helpAnchorEl: event.currentTarget });
    // };
    // const helpOpen = Boolean(showPasswordHelp);
    // const helpId = helpOpen ? 'password-help' : undefined;
    // const closePasswordHelp = () => {
    //   this.setState({ helpAnchorEl: null });
    // };
    return (
      <div>
        <Grid
          container
          spacing={4}
          direction={'column'}
          justify={'flex-start'}
          alignItems={'center'}
        >
          <Grid item className={this.props.classes.alignCenter}>
            <img src={logo} alt="logo" width={80} />
            <Typography variant={'h6'} align={'center'}>
              This extension is deprecated
            </Typography>
            <Typography>
              Please use{' '}
              <Link
                target={'_blank'}
                href="https://chromewebstore.google.com/detail/casper-wallet/abkahkcbhngaebpcgfmhkoioedceoigp"
              >
                Casper Wallet
              </Link>{' '}
              instead.
            </Typography>
          </Grid>

          <Grid item className={this.props.classes.alignCenter}>
            <Link
              target={'_blank'}
              href="https://chromewebstore.google.com/detail/casper-wallet/abkahkcbhngaebpcgfmhkoioedceoigp"
            >
              <img
                src={casperWalletBanner}
                alt="Casper Wallet Banner"
                width={268}
              />
            </Link>
          </Grid>

          {/*<Grid item container>*/}
          {/*  <form*/}
          {/*    style={{ textAlign: 'center', width: '100%' }}*/}
          {/*    onSubmit={e => e.preventDefault()}*/}
          {/*  >*/}
          {/*    <FormControl style={{ width: '80%', float: 'left' }}>*/}
          {/*      <TextFieldWithFormState*/}
          {/*        autoFocus*/}
          {/*        fieldState={*/}
          {/*          this.props.homeContainer.homeForm.$.setPasswordField*/}
          {/*        }*/}
          {/*        required*/}
          {/*        label={'Set Password'}*/}
          {/*        type={'password'}*/}
          {/*      />*/}
          {/*    </FormControl>*/}
          {/*<IconButton*/}
          {/*  onClick={showPasswordHelp}*/}
          {/*  style={{*/}
          {/*    float: 'right',*/}
          {/*    transform: 'translateY(.3em)'*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <HelpIcon />*/}
          {/*</IconButton>*/}
          {/*{this.state.helpAnchorEl && (*/}
          {/*  <Popover*/}
          {/*    id={helpId}*/}
          {/*    open={helpOpen}*/}
          {/*    anchorEl={this.state.helpAnchorEl}*/}
          {/*    onClose={closePasswordHelp}*/}
          {/*    anchorOrigin={{*/}
          {/*      vertical: 'top',*/}
          {/*      horizontal: 'right'*/}
          {/*    }}*/}
          {/*    transformOrigin={{*/}
          {/*      vertical: 'bottom',*/}
          {/*      horizontal: 'right'*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    <Typography*/}
          {/*      component={'summary'}*/}
          {/*      style={{*/}
          {/*        padding: '1.4em',*/}
          {/*        backgroundColor: 'var(--cspr-dark-blue)',*/}
          {/*        color: 'white'*/}
          {/*      }}*/}
          {/*    >*/}
          {/*      For a password of min. length 10 please include at least one*/}
          {/*      of each of the following:*/}
          {/*      <ul>*/}
          {/*        <li>lowercase letter</li>*/}
          {/*        <li>UPPERCASE letter</li>*/}
          {/*        <li>Number</li>*/}
          {/*        <li>Special character</li>*/}
          {/*      </ul>*/}
          {/*      Or you can enter a &gt;20 char passphrase if you would*/}
          {/*      prefer e.g. 'correct horse battery staple'*/}
          {/*    </Typography>*/}
          {/*  </Popover>*/}
          {/*)}*/}
          {/*    {this.props.homeContainer.homeForm.$.setPasswordField*/}
          {/*      .hasBeenValidated &&*/}
          {/*      !this.props.homeContainer.homeForm.$.setPasswordField*/}
          {/*        .hasError && (*/}
          {/*        <FormControl style={{ width: '80%', float: 'left' }}>*/}
          {/*          <TextFieldWithFormState*/}
          {/*            fieldState={*/}
          {/*              this.props.homeContainer.homeForm.$.confirmPasswordField*/}
          {/*            }*/}
          {/*            required*/}
          {/*            label={'Confirm Password'}*/}
          {/*            type={'password'}*/}
          {/*          />*/}
          {/*        </FormControl>*/}
          {/*      )}*/}
          {/*    <Typography variant="subtitle2" className="text-danger">*/}
          {/*      {this.props.homeContainer.homeForm.showFormError &&*/}
          {/*        this.props.homeContainer.homeForm.formError}*/}
          {/*    </Typography>*/}
          {/*    <FormControl fullWidth className={this.props.classes.margin}>*/}
          {/*      <Button*/}
          {/*        type="submit"*/}
          {/*        variant="contained"*/}
          {/*        color="primary"*/}
          {/*        disabled={this.props.homeContainer.createVaultDisabled}*/}
          {/*        onClick={async () => {*/}
          {/*          const password =*/}
          {/*            this.props.homeContainer.homeForm.$.setPasswordField.$;*/}
          {/*          await this.props.accountManager.createNewVault(password);*/}
          {/*          this.props.homeContainer.homeForm.$.setPasswordField.reset();*/}
          {/*          this.props.homeContainer.homeForm.$.confirmPasswordField.reset();*/}
          {/*        }}*/}
          {/*      >*/}
          {/*        Create Vault*/}
          {/*      </Button>*/}
          {/*    </FormControl>*/}
          {/*  </form>*/}
          {/*</Grid>*/}
        </Grid>
      </div>
    );
  }

  renderAccountLists() {
    return (
      <div>
        <Grid
          container
          spacing={4}
          direction={'column'}
          justify={'flex-start'}
          alignItems={'center'}
        >
          <Typography variant={'h6'} align={'center'}>
            This extension is deprecated
          </Typography>
          <Typography>
            Please use{' '}
            <Link
              target={'_blank'}
              href="https://chromewebstore.google.com/detail/casper-wallet/abkahkcbhngaebpcgfmhkoioedceoigp"
            >
              Casper Wallet
            </Link>{' '}
            instead.
          </Typography>

          <Grid item className={this.props.classes.alignCenter}>
            <Link
              target={'_blank'}
              href="https://chromewebstore.google.com/detail/casper-wallet/abkahkcbhngaebpcgfmhkoioedceoigp"
            >
              <img
                src={casperWalletBanner}
                alt="Casper Wallet Banner"
                width={268}
              />
            </Link>
          </Grid>

          {this.props.accountManager.userAccounts.length > 0 ? (
            <Grid item className={this.props.classes.alignCenter}>
              {this.props.accountManager.userAccounts.length > 1 ? (
                <Typography variant={'h6'} align={'center'}>
                  You have {this.props.accountManager.userAccounts.length}{' '}
                  account keys
                </Typography>
              ) : (
                <Typography variant={'h6'} align={'center'}>
                  You have {this.props.accountManager.userAccounts.length}{' '}
                  account key
                </Typography>
              )}
              {this.props.accountManager.activeUserAccount && (
                <Typography variant={'h6'} align={'center'}>
                  Active key:{' '}
                  <span style={{ wordBreak: 'break-all' }}>
                    {this.props.accountManager.activeUserAccount.alias}
                  </span>
                </Typography>
              )}
            </Grid>
          ) : (
            <Grid item className={this.props.classes.alignCenter}>
              <AddCircleIcon style={{ color: '#e24c2c', fontSize: '4rem' }} />
              <Typography variant={'h5'} align={'center'}>
                Please create an account to get started
              </Typography>
            </Grid>
          )}

          <Grid item>
            <FormControl fullWidth className={this.props.classes.margin}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  this.props.accountManager.downloadAllAccountKeys();
                }}
                style={{
                  backgroundColor: '#fff',
                  color: 'var(--cspr-dark-blue)'
                }}
              >
                Download All Account Keys
              </Button>
            </FormControl>
            <FormControl fullWidth className={this.props.classes.margin}>
              <Button
                // aria-label="This will open a form to create an account - focus will be given to the input field for key name"
                // component={L}
                variant="contained"
                color="primary"
                // to={Pages.CreateAccount}
                onClick={() => {
                  this.props.accountManager.lock();
                }}
                style={{
                  backgroundColor: '#fff',
                  color: 'var(--cspr-dark-blue)'
                }}
              >
                Lock
              </Button>
            </FormControl>
          </Grid>
        </Grid>
      </div>
    );
  }

  // resetVaultOnClick() {
  //   confirm(
  //     <div className="text-danger">Reset Vault</div>,
  //     'Resetting vault will permanently delete all accounts. You must have key files backed up if you want to recover them in the future.',
  //     'Reset',
  //     'Cancel',
  //     {
  //       requireCheckbox: true,
  //       checkboxText: 'I have read and understand the above.'
  //     }
  //   ).then(() => {
  //     this.props.accountManager.resetVault();
  //     this.props.errors.dismissLast();
  //     this.props.homeContainer.homeForm.$.setPasswordField.reset();
  //   });
  // }

  async tryUnlock() {
    const password = this.props.homeContainer.homeForm.$.unlockPasswordField.$;
    try {
      await this.props.accountManager.unlock(password);
      this.props.homeContainer.homeForm.$.unlockPasswordField.reset();
      this.props.errors.dismissLast();
    } catch (e) {
      this.props.homeContainer.homeForm.$.unlockPasswordField.setError(
        (e as Error).message
      );
    }
  }

  renderUnlock() {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <Grid
          container
          spacing={4}
          direction={'column'}
          justify={'flex-start'}
          alignItems={'center'}
        >
          <Grid item className={this.props.classes.alignCenter}>
            <img src={logo} alt="logo" width={120} />
            <Typography variant={'h4'} align={'center'}>
              Unlock Vault
            </Typography>
          </Grid>

          <Grid item container>
            <div style={{ textAlign: 'center' }}>
              <FormControl fullWidth>
                <TextFieldWithFormState
                  aria-label="Enter password for vault"
                  autoFocus={true}
                  fieldState={
                    this.props.homeContainer.homeForm.$.unlockPasswordField
                  }
                  required
                  id={'unlock-password'}
                  label={'Password'}
                  type={'password'}
                />
              </FormControl>
              {this.props.accountManager.remainingUnlockAttempts < 5 && (
                <FormControl fullWidth style={{ marginTop: '.5rem' }}>
                  <Typography variant={'subtitle1'}>
                    Attempts remaining:{' '}
                    {this.props.accountManager.remainingUnlockAttempts}
                  </Typography>
                </FormControl>
              )}
              <FormControl fullWidth className={this.props.classes.margin}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  classes={{
                    root: this.props.classes.unlockButton,
                    disabled: this.props.classes.disabled
                  }}
                  disabled={this.props.homeContainer.unlockDisabled}
                  onClick={async () => await this.tryUnlock()}
                >
                  Unlock
                </Button>
              </FormControl>
              {/*<div className="reset-vault">*/}
              {/*  <a*/}
              {/*    aria-label="Reset vault - this will open a confirmation before erasing keys"*/}
              {/*    href="#"*/}
              {/*    className="text-danger"*/}
              {/*    id="reset-link"*/}
              {/*    onClick={() => this.resetVaultOnClick()}*/}
              {/*  >*/}
              {/*    Reset Vault?*/}
              {/*  </a>*/}
              {/*</div>*/}
            </div>
          </Grid>
        </Grid>
      </form>
    );
  }

  renderLockedOut() {
    if (
      this.props.accountManager.isLockedOut &&
      !this.props.accountManager.lockoutTimerStarted
    ) {
      // 5 minute timer before resetting lockout
      this.props.accountManager.startLockoutTimer(
        this.props.accountManager.timerDuration
      );
    }
    return (
      <div className={this.props.classes.lockout}>
        <NotInterestedIcon style={{ fontSize: '5.5rem' }} />
        <Typography variant={'body1'}>
          Your vault has been temporarily locked out due to too many incorrect
          password attempts.
        </Typography>
        <Typography variant={'h6'}>
          Please try again in{' '}
          {Math.round(this.props.accountManager.remainingMins)} minute
          {this.props.accountManager.remainingMins <= 1 ? '.' : 's.'}
        </Typography>
      </div>
    );
  }

  render() {
    if (this.props.accountManager.hasCreatedVault) {
      if (this.props.accountManager.isUnLocked) {
        return this.renderAccountLists();
        // if (
        //   !this.props.connectionContainer.connectionStatus &&
        //   this.props.connectionContainer.connectionRequested
        // ) {
        //   // Not connected and there is a request to connect
        //   if (this.props.accountManager.userAccounts.length < 1) {
        //     // Don't prompt for connection if there are no accounts
        //     return this.renderAccountLists();
        //   } else {
        //     return <Redirect to={Pages.ConnectSigner} />;
        //   }
        // } else {
        //   if (this.props.signingContainer.deployToSign) {
        //     return <Redirect to={Pages.SignDeploy} />;
        //   } else if (this.props.signingContainer.messageToSign) {
        //     return SignMessagePage(
        //       this.props.signingContainer,
        //       this.props.popupContainer
        //     );
        //   } else {
        //     return this.renderAccountLists();
        //   }
        // }
      } else {
        if (this.props.accountManager.isLockedOut) {
          return this.renderLockedOut();
        } else {
          return this.renderUnlock();
        }
      }
    } else {
      return this.renderCreateNewVault();
    }
  }
}

export default withStyles(styles, { withTheme: true })(withRouter(Home));
