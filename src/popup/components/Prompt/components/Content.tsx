import React, { ReactNode } from 'react';
import {
  DialogContent,
  DialogContentText,
  makeStyles
} from '@material-ui/core';

const styles = {
  MuiDialogContent: {
    padding: '4px 10px 26px',

    '& .MuiLink-button': {
      color: 'var(--cspr-red)',
      lineHeight: '0'
    },

    '& p': {
      marginTop: '8px',
      marginBlockEnd: '0'
    },

    '& ul': {
      marginTop: '8px',
      paddingLeft: '18px',
      marginBlockStart: '6px',
      marginBlockEnd: '0'
    },

    '& .MuiList-root': {
      paddingTop: '0',
      paddingBottom: '20px',

      '& .MuiListItem-root': {
        paddingTop: '0',
        paddingLeft: '0'
      },

      '& .MuiListItemText-root': {
        marginTop: '6px',
        marginBottom: '6px',
        paddingTop: '0',

        '& .MuiTypography-body1': {
          fontSize: '14px'
        }
      }
    }
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
