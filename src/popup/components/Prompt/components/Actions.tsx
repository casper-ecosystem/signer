import React, { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';

const styles = {
  buttonContainerStyle: {
    position: 'fixed' as const,
    bottom: '42px',
    width: '228px',
    marginLeft: '10px',
    marginRight: '10px'
  }
};

const useStyles = makeStyles(styles);

interface Props {
  children: ReactNode;
}

export function Actions({ children }: Props): JSX.Element {
  const classes = useStyles();
  return <div className={classes.buttonContainerStyle}>{children}</div>;
}
