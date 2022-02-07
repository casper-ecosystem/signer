import React from 'react';
import { Dialog, withStyles, WithStyles } from '@material-ui/core';

const styles = {
  dialogPaper: {
    minHeight: '90vh',
    maxHeight: '90vh',
    height: '90vh',
    margin: '16px',
    width: 'calc(100% - 32px)'
  }
};

interface Props extends WithStyles<typeof styles> {
  isOpened: boolean;
  Header: React.FC;
  Content: React.FC;
  Actions: React.FC;
}

function Prompt({
  classes,
  isOpened,
  Header,
  Content,
  Actions
}: Props): JSX.Element {
  return (
    <Dialog fullWidth classes={{ paper: classes.dialogPaper }} open={isOpened}>
      <div className="prompt-container">
        <Header />
        <Content />
        <Actions />
      </div>
    </Dialog>
  );
}

export default withStyles(styles)(Prompt);
