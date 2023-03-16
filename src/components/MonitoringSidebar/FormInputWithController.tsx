import { Checkbox, Radio } from '@cognite/cogs.js';
import { Controller } from 'react-hook-form';
import { FormInput, FormInputNumber, FormSelect } from './elements';
import { SourceSelector } from '../Common/SourceSelector';

const FormInputWithController = ({
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
}: // defaultValue,
any) => (
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
            <>
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
            </>
          )}
        </>
      );
    }}
  />
);

export default FormInputWithController;
