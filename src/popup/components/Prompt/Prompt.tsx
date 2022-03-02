import React from 'react';
import { Dialog } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Header, Content, Actions } from './components';

const styles = {
  promptContainer: {
    padding: '10px'
  },
  dialogPaper: {
    minHeight: '95vh',
    maxHeight: '95vh',
    height: '95vh',
    margin: '16px',
    width: 'calc(100% - 32px)'
  }
};

const useStyles = makeStyles(styles);

interface Props {
  isOpened: boolean;
  renderHeader(): JSX.Element;
  renderContent(): JSX.Element;
  renderActions(): JSX.Element;
}

export function Prompt({
  isOpened,
  renderHeader,
  renderContent,
  renderActions
}: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Dialog fullWidth classes={{ paper: classes.dialogPaper }} open={isOpened}>
      <div className={classes.promptContainer}>
        <Header>{renderHeader()}</Header>
        <Content>{renderContent()}</Content>
        <Actions>{renderActions()}</Actions>
      </div>
    </Dialog>
  );
}
