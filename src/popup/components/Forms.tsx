import React from 'react';
import { observer } from 'mobx-react';
import { FieldState } from 'formstate';
import { StandardTextFieldProps, TextField } from '@material-ui/core';

export interface TextFieldWithFormStateProps extends StandardTextFieldProps {
  fieldState?: FieldState<string>;
}

export const TextFieldWithFormState = observer(
  (props: TextFieldWithFormStateProps) => {
    const { fieldState, ...otherProps } = props;
    return (
      <TextField
        value={fieldState?.value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          fieldState?.onChange(e.target.value);
        }}
        error={fieldState?.hasError}
        helperText={fieldState?.error}
        {...otherProps}
      />
    );
  }
);
