import React, { ReactNode } from 'react';
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
  children: ReactNode;
}

export function Header({ children }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <DialogTitle classes={{ root: classes.MuiDialogTitle }}>
      {children}
    </DialogTitle>
  );
}
