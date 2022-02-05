import React from 'react';
import { Dialog, withStyles, WithStyles } from '@material-ui/core';

interface PromptProps extends WithStyles<typeof styles> {
  isOpened: boolean;
  Header: React.FC;
  Content: React.FC;
  Actions: React.FC;
}

const styles = {
  dialogPaper: {
    minHeight: '90vh',
    maxHeight: '90vh',
    height: '90vh'
  }
};

function Prompt({
  classes,
  isOpened,
  Header,
  Content,
  Actions
}: PromptProps): JSX.Element {
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
