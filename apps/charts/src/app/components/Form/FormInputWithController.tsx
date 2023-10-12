import { FC } from 'react';
import { Controller, Control, RegisterOptions } from 'react-hook-form';

import { Radio, OptionType, Tooltip } from '@cognite/cogs.js';

import { SourceSelector } from '../Common/SourceSelector';
import { DatasetSelector } from '../Dataset/DatasetSelector';
import { UnitSelector } from '../UnitDropdown/UnitSelector';

import {
  FormInput,
  FormTextarea,
  FormInputNumber,
  FormSelect,
  FieldTitleRequired,
  FieldTitle,
  FieldTitleInfo,
} from './elements';

type Props = RegisterOptions<any> & {
  name: string;
  type:
    | 'number'
    | 'text'
    | 'textarea'
    | 'select'
    | 'timeseries'
    | 'radio'
    | 'unit'
    | 'dataset';
  control?: Control<any>;
  options?: OptionType<any>[];
  placeholder?: string;
  max?: number;
  suffix?: React.ReactNode;
  id?: string;
  title?: string;
  info?: string;
  radioValue?: string;
  autoFocus?: boolean;
  label?: string;
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

export const FormInputWithController: FC<Props> = ({
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
  id,
  title,
  info,
  radioValue,
  autoFocus,
  label,
}) => (
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
                autoFocus={autoFocus}
              />
            )}
            {type === 'textarea' && (
              <FormTextarea
                ref={ref}
                // onBlur={onBlur} // not present on type
                onChange={onChange} // send value to hook form
                value={value}
                placeholder={placeholder}
                fullWidth
                autoResize
              />
            )}
            {type === 'timeseries' && (
              <>
                <SourceSelector
                  ref={ref}
                  onBlur={onBlur} // notify when input is touched
                  onChange={onChange} // send value to hook form
                  value={value}
                  selectableSourceTypes={['timeseries', 'scheduledCalculation']}
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
                size="small"
              />
            )}
            {type === 'radio' && (
              <Radio
                id={id}
                ref={ref}
                name={name}
                // onBlur={onBlur} // not present on type
                onChange={onChange}
                checked={value === radioValue}
                value={radioValue}
                label={label}
              />
            )}
            {type === 'unit' && (
              <UnitSelector
                ref={ref}
                onBlur={onBlur} // notify when input is touched
                onChange={onChange} // send value to hook form
                value={value}
              />
            )}
            {type === 'dataset' && (
              <DatasetSelector
                ref={ref}
                onBlur={onBlur}
                onChange={onChange} // send value to hook form
                value={value}
              />
            )}
          </>
        );
      }}
    />
  </>
);

export default FormInputWithController;
