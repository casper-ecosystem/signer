import React from 'react';
import {
  confirmable,
  createConfirmation,
  ReactConfirmProps
} from 'react-confirm';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';

interface Props extends ReactConfirmProps {
  proceedLabel: string;
  cancelLabel: string;
  title: string | React.ReactElement;
}

class Confirmation extends React.Component<Props, {}> {
  render() {
    return (
      <Dialog
        open={this.props.show}
        onClose={this.props.dismiss}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.props.confirmation}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              this.props.cancel();
            }}
            color="secondary"
          >
            {this.props.cancelLabel}
          </Button>
          <Button
            onClick={() => {
              this.props.proceed();
            }}
            color="primary"
            autoFocus
          >
            {this.props.proceedLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export function confirm(
  title: string | React.ReactElement,
  confirmation: string | React.ReactElement,
  proceedLabel = 'OK',
  cancelLabel = 'cancel',
  options = {}
) {
  return createConfirmation(confirmable(Confirmation))({
    title,
    confirmation,
    proceedLabel,
    cancelLabel,
    ...options
  });
}
