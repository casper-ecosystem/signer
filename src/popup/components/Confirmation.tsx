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
  DialogTitle,
  FormControl
} from '@material-ui/core';
import { TextFieldWithFormState } from '../components/Forms';
import AccountManager from '../container/AccountManager';
import { ErrorContainer } from '../container/ErrorContainer';
import { BackgroundManager } from '../BackgroundManager';
import { AppState } from '../../lib/MemStore';

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

class ConfirmationWithPassword extends React.Component<Props, {}> {
  private errors = new ErrorContainer();
  private appState = new AppState();
  private background = new BackgroundManager(this.appState, this.errors);
  private accountManager = new AccountManager(
    this.errors,
    this.background,
    this.appState
  );
  render() {
    return (
      <Dialog
        open={this.props.show}
        onClose={this.props.dismiss}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{this.props.title}</DialogTitle>
        <form>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {this.props.confirmation}
            </DialogContentText>
            <FormControl>
              <TextFieldWithFormState
                autoFocus={true}
                fieldState={
                  this.accountManager.confirmPasswordForm.$.confirmPasswordField
                }
                required
                label={'Password'}
                type={'password'}
              />
            </FormControl>
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
            <FormControl>
              <Button
                type="submit"
                // TODO: This doesn't work - doesn't enable when field is non-null.
                // disabled={this.accountManager.confirmPasswordDisabled}
                onClick={async () => {
                  let givenPassword =
                    this.accountManager.confirmPasswordForm.$
                      .confirmPasswordField.$;
                  try {
                    await this.accountManager.confirmPassword(givenPassword);
                    this.accountManager.confirmPasswordForm.$.confirmPasswordField.reset();
                    this.errors.dismissLast();
                    this.props.proceed();
                  } catch (e) {
                    this.accountManager.confirmPasswordForm.$.confirmPasswordField.setError(
                      e.message
                    );
                  }
                }}
                color="primary"
              >
                {this.props.proceedLabel}
              </Button>
            </FormControl>
          </DialogActions>
        </form>
      </Dialog>
    );
  }
}

export function confirmWithPassword(
  title: string | React.ReactElement,
  confirmation: string | React.ReactElement,
  proceedLabel = 'Confirm',
  cancelLabel = 'Cancel',
  options = {}
) {
  return createConfirmation(confirmable(ConfirmationWithPassword))({
    title,
    confirmation,
    proceedLabel,
    cancelLabel,
    ...options
  });
}
