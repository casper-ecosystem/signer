import { FieldState } from 'formstate';

export const valueRequired = (val: any) => !val && 'Value required';

export const fieldSubmittable = (val: FieldState<any>) => {
  return val.hasBeenValidated && !val.hasError;
};
