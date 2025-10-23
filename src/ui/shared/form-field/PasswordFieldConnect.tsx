import { Control, Controller, ControllerProps, FieldPath, FieldPathValue, FieldValues, PathValue, useFormContext } from 'react-hook-form'
import { TextFieldProps } from '../input/TextField/TextField'
import PasswordField from '../input/PasswordField/PasswordField'

type PasswordFieldConnectProps<
  F extends FieldValues,
  N extends FieldPath<F>
> = Omit<TextFieldProps, 'type' | 'value' | 'error' | 'onChange' | 'helperText'> & {
  name: N
  control?: Control<F>
  defaultValue?: FieldPathValue<F, N>
  rules?: ControllerProps<F, N>['rules']
}

const PasswordFieldConnect = <
  F extends FieldValues,
  N extends FieldPath<F>
>({
  name,
  control,
  defaultValue,
  rules,
  ...inputProps
}: PasswordFieldConnectProps<F, N>) => {
  const formContext = useFormContext<F>()
  const formControl = control ?? formContext?.control

  return (
    <Controller
      name={name}
      control={formControl}
      defaultValue={defaultValue}
      rules={rules}
      render={({ field, fieldState }) => (
        <PasswordField
          {...field}
          {...inputProps}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  )
}

export default PasswordFieldConnect
