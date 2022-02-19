import React, { ReactNode } from 'react';
import {
  DialogContent,
  DialogContentText,
  makeStyles
} from '@material-ui/core';

const styles = {
  MuiDialogContent: {
    padding: '4px 10px'
  },
  MuiTypography: {
    fontSize: '14px',
    marginBlockEnd: '7px'
  }
};

const useStyles = makeStyles(styles);

interface Props {
  children: ReactNode;
}

export function Content({ children }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <DialogContent classes={{ root: classes.MuiDialogContent }}>
      <DialogContentText classes={{ root: classes.MuiTypography }}>
        {children}
      </DialogContentText>
    </DialogContent>
  );
}
