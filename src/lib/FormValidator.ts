import { FieldState } from 'formstate';
import owasp from 'owasp-password-strength-test';

owasp.tests.required.push((password: any) => {
  let passwordString = password.toString() as String;
  if (passwordString.match(/correct\s*horse\s*battery\s*staple/i) !== null) {
    return 'Use your imagination not the example!';
  }
});

export const valueRequired = (val: any) => !val && 'Value required';

export const valuesMatch = (val1: any, val2: any) =>
  !(val1 === val2) && 'Passwords must match';

export const isAlgorithm = (val: any) =>
  !(val === 'ed25519' || val === 'secp256k1') && 'Invalid Algorithm';

export const fieldSubmittable = (val: FieldState<any>) => {
  return val.hasBeenValidated && !val.hasError;
};

export const strongPassword = (val: any) => {
  let result = owasp.test(val);
  return !result.strong && result.errors[0];
};
