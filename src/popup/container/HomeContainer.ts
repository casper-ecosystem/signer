import { FieldState, FormState } from 'formstate';
import { valueRequired, valuesMatch } from '../../lib/FormValidator';
import { computed } from 'mobx';

export class HomeContainer {
  homeForm = new FormState({
    // The text field for storing user input password, used in 'Create Vault' and 'Unlock Vault' page.
    setPasswordField: new FieldState<string>('').validators(valueRequired),

    confirmPasswordField: new FieldState<string>('').validators(valueRequired)
  })
    .compose()
    .validators($ =>
      valuesMatch($.setPasswordField.$, $.confirmPasswordField.$)
    );

  @computed
  get submitDisabled(): boolean {
    return (
      !this.homeForm.$.setPasswordField.hasBeenValidated ||
      (this.homeForm.$.setPasswordField.hasBeenValidated &&
        this.homeForm.$.setPasswordField.hasError)
    );
  }

  @computed
  get createVaultDisabled(): boolean {
    return (
      !this.homeForm.$.setPasswordField.hasBeenValidated ||
      (this.homeForm.$.setPasswordField.hasBeenValidated &&
        this.homeForm.$.setPasswordField.hasError) ||
      !this.homeForm.$.confirmPasswordField.hasBeenValidated ||
      (this.homeForm.$.confirmPasswordField.hasBeenValidated &&
        this.homeForm.$.confirmPasswordField.hasError) ||
      !(
        this.homeForm.$.setPasswordField.value ===
        this.homeForm.$.confirmPasswordField.value
      )
    );
  }
}
