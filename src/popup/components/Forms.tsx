import React from 'react';
import { observer } from 'mobx-react';
import { FieldState } from 'formstate';

interface FieldProps<T> {
  id: string;
  label?: string;
  fieldState: FieldState<T>;
  placeholder?: string;
  width?: number;
  readonly?: boolean;
}

interface TextProps extends FieldProps<string> {
  unit?: string;
  type?: string;
  numeric?: boolean;
}

interface NumberInputProps extends FieldProps<number> {
  unit?: string;
}

interface FormProps {
  // Expecting to see `<Field />` nested
  // or `<dif class="form-row"><Field /><Field/>`
  children?: any;
  onSubmit?: () => void;
}

interface FileUploaderProps {
  id: string;
  label: string;
  width?: number;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function controlClass(props: FieldProps<any>) {
  if (props.readonly) {
    return 'form-control';
  }
  let validity = !props.fieldState.hasBeenValidated
    ? ''
    : props.fieldState.hasError
    ? 'is-invalid'
    : '';
  return ['form-control', validity].join(' ');
}

export const TextField = observer((props: TextProps) => {
  let v: string;
  let errorMsg = null;
  if (props.fieldState instanceof FieldState) {
    v = props.fieldState.value as string;
    errorMsg = props.fieldState.error;
  } else {
    v = props.fieldState as string;
  }
  let input = (
    <input
      className={controlClass(props)}
      id={props.id}
      type={props.type ?? 'text'}
      placeholder={props.placeholder}
      value={v}
      readOnly={props.readonly || false}
      onChange={e => {
        if (!props.readonly || props.fieldState instanceof String) {
          (props.fieldState as FieldState<string>).onChange(e.target.value);
        }
      }}
      onBlur={() => {
        if (!props.readonly || props.fieldState instanceof String) {
          (props.fieldState as FieldState<
            string
          >).enableAutoValidationAndValidate();
        }
      }}
    />
  );
  let cu = (props.unit && 'has-unit') || '';
  let cn = (props.numeric && 'numeric') || '';
  return (
    <div className={[cu, cn].filter(x => x !== '').join(' ')}>
      {props.label && <label htmlFor={props.id}>{props.label}</label>}
      {(props.unit && (
        <div className="input-group">
          {input}
          <div className="input-group-addon">{props.unit}</div>
        </div>
      )) ||
        input}
      {errorMsg && <div className="invalid-feedback">{errorMsg}</div>}
    </div>
  );
});

export const NumberField = observer((props: NumberInputProps) => {
  let input = (
    <input
      className={controlClass(props)}
      id={props.id}
      type="number"
      placeholder={props.placeholder}
      value={(props.fieldState as FieldState<number>).value.toString()}
      readOnly={props.readonly || false}
      onChange={e => {
        const strValue = e.target.value;
        if (isNaN(+strValue)) {
        } else {
          (props.fieldState as FieldState<number>).onChange(+strValue);
        }
      }}
    />
  );
  return (
    <div>
      <label htmlFor={props.id}>{props.label}</label>
      {(props.unit && (
        <div className="input-group">
          {input}
          <div className="input-group-addon">{props.unit}</div>
        </div>
      )) ||
        input}
      {(props.fieldState as FieldState<number>).hasError && (
        <div className="invalid-feedback">
          {(props.fieldState as FieldState<number>).error}
        </div>
      )}
    </div>
  );
});

export const FileSelect = (props: FileUploaderProps) => (
  <div className={`custom-file col-md-${props.width ?? 12}`}>
    <input
      type="file"
      className="custom-file-input"
      id={props.id}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        props.handleFileSelect(e)
      }
    />
    <label className="custom-file-label" htmlFor={props.id}>
      {props.label}
    </label>
  </div>
);

export const Form = (props: FormProps) => {
  const children = [].concat(props.children);
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        props.onSubmit && props.onSubmit();
        return false;
      }}
    >
      {children.map((group: any, idx: number) => (
        <div className="form-group" key={idx}>
          {group}
        </div>
      ))}
    </form>
  );
};

export const ErrorMessage = (props: { error: string | null }) =>
  props.error ? (
    <div
      className="alert alert-danger"
      role="alert"
      style={{ fontSize: 'small' }}
    >
      {props.error}
    </div>
  ) : null;
