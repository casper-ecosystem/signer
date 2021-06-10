import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { ErrorContainer } from '../container/ErrorContainer';
import AccountManager from '../container/AccountManager';

export function Lockout(
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
  // const [lockoutTimer, setLockoutTimer] = useState(10);

  // useEffect(function reset() {
  //   console.log('mounted');
  // });

  return (
    <div>
      <Typography variant={'h4'}>Locked Out</Typography>
      {/* <Typography>Timer: {lockoutTimer}</Typography> */}
      <Typography>{accountManager.remainingUnlockAttempts}</Typography>
      <Button onClick={() => accountManager.resetLockout()}>Reset</Button>
    </div>
  );
}
