import { FieldState } from 'formstate';
import { valueRequired } from '../../lib/FormValidator';
import { computed } from 'mobx';

export class HomeContainer {
  // The text field for storing user input password, used in 'Create Vault' and 'Unlock Vault' page.
  passwordField: FieldState<string> = new FieldState<string>('').validators(
    valueRequired
  );

  @computed
  get submitDisabled(): boolean {
    return (
      !this.passwordField.hasBeenValidated ||
      (this.passwordField.hasBeenValidated && this.passwordField.hasError)
    );
  }
}
