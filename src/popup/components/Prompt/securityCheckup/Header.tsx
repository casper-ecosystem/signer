import React from 'react';
import { DialogTitle, makeStyles } from '@material-ui/core';

const styles = {
  MuiDialogTitle: {
    padding: '0',
    textAlign: 'center' as const,
    marginTop: '15px'
  }
};

const useStyles = makeStyles(styles);

interface Props {
  isOnInitialScreen: boolean;
}

export function Header({ isOnInitialScreen }: Props): JSX.Element {
  const classes = useStyles();

  if (!isOnInitialScreen) {
    return <></>;
  }

  return (
    <DialogTitle classes={{ root: classes.MuiDialogTitle }}>
      Protect your funds
    </DialogTitle>
  );
}
