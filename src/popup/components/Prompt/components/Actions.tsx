import React from 'react';
import { Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';

const styles = {
  closeButtonStyle: {
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  backButtonStyle: {
    position: 'fixed' as const,
    bottom: '42px',
    width: '228px',
    marginLeft: '10px',
    marginRight: '10px'
  }
};

const useStyles = makeStyles(styles);

interface Props {
  closeHandler: () => void;
  goBackHandler: () => void;
  isOnInitialScreen: boolean;
}

export function Actions({
  closeHandler,
  goBackHandler,
  isOnInitialScreen
}: Props): JSX.Element {
  const classes = useStyles();

  if (!isOnInitialScreen) {
    return (
      <div className={classes.backButtonStyle}>
        <Button fullWidth onClick={goBackHandler}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className={classes.closeButtonStyle}>
      <Button fullWidth onClick={closeHandler}>
        I have backed up all my accounts
      </Button>
    </div>
  );
}
