import { FieldState } from 'formstate';

export const valueRequired = (val: any) => !val && 'Value required';

export const valuesMatch = (val1: any, val2: any) =>
  !(val1 === val2) && 'Values must match';

export const isAlgorithm = (val: any) =>
  !(val === 'ed25519' || val === 'secp256k1') && 'Invalid Algorithm';

export const fieldSubmittable = (val: FieldState<any>) => {
  return val.hasBeenValidated && !val.hasError;
};

export const minNameLength = (val: string) => {
  return !(val.length > 2) && 'Invalid name - too short';
};

export const humanReadable = (val: string) => {
  // Accept any alphanumeric (also underscores)
  const humanReadableRegex = /^\w+$/;
  return (
    !val.match(humanReadableRegex) &&
    'Invalid name - only use A-Z, a-z, 0-9 and _'
  );
};
