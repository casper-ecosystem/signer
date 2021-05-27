import React from 'react';
import { observer } from 'mobx-react';
import { FieldState } from 'formstate';
import {
  StandardTextFieldProps,
  TextField,
  SelectProps,
  Select,
  MenuItem
} from '@material-ui/core';

export interface TextFieldWithFormStateProps extends StandardTextFieldProps {
  fieldState?: FieldState<string>;
}

export interface SelectWithFormStateProps extends SelectProps {
  fieldState?: FieldState<string>;
  selectItems: { value: string; text: string }[];
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

export const SelectFieldWithFormState = observer(
  (props: SelectWithFormStateProps) => {
    const { fieldState, selectItems, ...otherProps } = props;
    return (
      <Select
        value={fieldState?.value}
        onChange={(e: React.ChangeEvent<{ value: unknown }>) => {
          fieldState?.onChange((e.target.value as string) || '');
        }}
        error={fieldState?.hasError}
        {...otherProps}
      >
        {selectItems.map(item => {
          return (
            <MenuItem key={item.value} value={item.value}>
              {item.text}
            </MenuItem>
          );
        })}
      </Select>
    );
  }
);
