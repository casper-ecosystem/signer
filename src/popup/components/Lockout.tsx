import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { ErrorContainer } from '../container/ErrorContainer';
import AccountManager from '../container/AccountManager';

export default function Lockout(
  errorsContainer: ErrorContainer,
  accountManager: AccountManager
) {
  // const useStyles = makeStyles({
  //   root: {
  //     position: 'absolute',
  //     top: 0,
  //     right: 0,
  //     left: 0,
  //     bottom: 0,
  //     background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  //     padding: '2em'
  //   }
  // });

  // const classes = useStyles();
  // var lockoutTimer;

  // useEffect(() => {
  //   // errorsContainer.dismissLast();
  //   // Cancel lockout after 5 minutes
  // });

  return (
    <div>
      <Typography variant={'h4'}>Locked Out</Typography>
      {/* {lockoutTimer !== undefined ?? lockoutTimer.current !== undefined ?? (
        <Typography variant={'body1'}>
          Time left: {lockoutTimer.current}
        </Typography>
      )} */}
      <Typography>{accountManager.remainingUnlockAttempts}</Typography>
      <Button onClick={() => accountManager.resetLockOut()}>Reset</Button>
    </div>
  );
}
