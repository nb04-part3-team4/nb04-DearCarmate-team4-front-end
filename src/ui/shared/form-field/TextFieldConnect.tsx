import { Control, Controller, ControllerProps, FieldPath, FieldPathValue, FieldValues, PathValue, useFormContext } from 'react-hook-form'
import TextField, { TextFieldProps } from '../input/TextField/TextField'

type TextFieldConnectProps<
  F extends FieldValues,
  N extends FieldPath<F>
> = Omit<TextFieldProps, 'value' | 'error' | 'onChange' | 'helperText'> & {
  name: N
  control?: Control<F>
  defaultValue?: FieldPathValue<F, N>
  rules?: ControllerProps<F, N>['rules']
}

const TextFieldConnect = <
  F extends FieldValues,
  N extends FieldPath<F>
>({
  name,
  control,
  defaultValue,
  rules,
  ...inputProps
}: TextFieldConnectProps<F, N>) => {
  const formContext = useFormContext<F>()
  const formControl = control ?? formContext?.control

  return (
    <Controller
      name={name}
      control={formControl}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...inputProps}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )
}

export default TextFieldConnect
