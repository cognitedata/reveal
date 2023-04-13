import { Checkbox, Radio, OptionType, Tooltip } from '@cognite/cogs.js';
import { Controller, Control, RegisterOptions } from 'react-hook-form';
import {
  FormInput,
  FormTextarea,
  FormInputNumber,
  FormSelect,
  FieldTitleRequired,
  FieldTitle,
  FieldTitleInfo,
} from './elements';
import { SourceSelector } from '../Common/SourceSelector';

type Props = RegisterOptions<any> & {
  name: string;
  type:
    | 'number'
    | 'text'
    | 'textarea'
    | 'select'
    | 'timeseries'
    | 'checkbox'
    | 'radio';
  control?: Control<any>;
  options?: OptionType<any>[];
  placeholder?: string;
  max?: number;
  suffix?: React.ReactNode;
  defaultValue?: boolean;
  id?: string;
  title?: string;
  info?: string;
};

const FieldLabel = ({
  title,
  info,
  required,
}: Pick<Props, 'title' | 'info' | 'required'>) => {
  if (!title) {
    return null;
  }
  if (info) {
    <Tooltip content={info}>
      <FieldTitleInfo>{title}</FieldTitleInfo>
    </Tooltip>;
  }
  if (required) {
    return <FieldTitleRequired>{title}</FieldTitleRequired>;
  }
  return <FieldTitle>{title}</FieldTitle>;
};

export const FormInputWithController = ({
  control,
  name,
  type,
  options,
  placeholder,
  required,
  minLength,
  validate,
  deps,
  max,
  suffix,
  defaultValue,
  id,
  title,
  info,
}: Props) => (
  <>
    <FieldLabel title={title} info={info} required={required} />
    <Controller
      control={control}
      name={name}
      rules={{
        required,
        minLength,
        validate,
        deps,
      }}
      render={({ field: { onChange, onBlur, value, ref } }) => {
        return (
          <>
            {type === 'number' && (
              <FormInputNumber
                onChange={onChange}
                onBlur={onBlur}
                suffix={suffix}
                type={type}
                max={max}
                ref={ref}
                value={value}
                placeholder={placeholder}
              />
            )}
            {type === 'text' && (
              <FormInput
                ref={ref}
                fullWidth
                onBlur={onBlur} // notify when input is touched
                onChange={onChange} // send value to hook form
                value={value}
                placeholder={placeholder}
              />
            )}
            {type === 'textarea' && (
              <FormTextarea
                ref={ref}
                onBlur={onBlur} // notify when input is touched
                onChange={onChange} // send value to hook form
                value={value}
                placeholder={placeholder}
              />
            )}
            {type === 'timeseries' && (
              <>
                <SourceSelector
                  ref={ref}
                  onBlur={onBlur} // notify when input is touched
                  onChange={onChange} // send value to hook form
                  value={value}
                  onlyTimeseries
                />
              </>
            )}
            {type === 'select' && (
              <FormSelect
                ref={ref}
                onBlur={onBlur} // notify when input is touched
                onChange={onChange} // send value to hook form
                value={value}
                options={options}
              />
            )}
            {type === 'checkbox' && (
              <Checkbox
                ref={ref}
                onBlur={onBlur} // notify when input is touched
                onChange={onChange} // send value to hook form
                checked={value === true}
                name={name}
              />
            )}
            {type === 'radio' && (
              <Radio
                id={id}
                ref={ref}
                onBlur={onBlur} // notify when input is touched
                onClick={() => {
                  onChange(defaultValue);
                }}
                // send value to hook form
                checked={value === defaultValue}
                name={name}
              />
            )}
          </>
        );
      }}
    />
  </>
);

export default FormInputWithController;
