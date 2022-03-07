import React, { ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';

const styles = {
  buttonContainerStyle: {
    position: 'fixed' as const,
    bottom: '20px',
    width: '228px',
    marginLeft: '10px',
    marginRight: '10px',
    marginBottom: '10px',

    '& .MuiButton-containedPrimary': {
      backgroundColor: 'var(--cspr-red)',
      color: 'white',
      '&$disabled': {
        backgroundColor: 'white',
        color: 'grey'
      }
    },

    '& .MuiButton-containedSecondary': {
      backgroundColor: 'var(--cspr-dark-blue)',
      color: 'white',
      '&$disabled': {
        backgroundColor: 'white',
        color: 'grey'
      }
    }
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
