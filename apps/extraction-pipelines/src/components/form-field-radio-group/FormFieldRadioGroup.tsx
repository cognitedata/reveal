import React from 'react';

import styled from 'styled-components';

import { Colors, Flex, FlexProps, Radio } from '@cognite/cogs.js';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '../form-field-wrapper/FormFieldWrapper';

type FormFieldRadioGroupProps<V> = Omit<FormFieldWrapperProps, 'children'> & {
  direction?: FlexProps['direction'];
  onChange: (value: V) => void;
  options: FormFieldRadioOption<V>[];
  value: V;
};

type FormFieldRadioOption<V> = {
  details?: string;
  label: string;
  value: V;
};

const FormFieldRadioGroup = <V extends string>({
  direction,
  isRequired,
  onChange,
  options,
  title,
  value: selectedValue,
}: FormFieldRadioGroupProps<V>): JSX.Element => {
  return (
    <FormFieldWrapper isRequired={isRequired} title={title}>
      <Flex direction={direction} gap={8}>
        {options.map(({ details, label, value }) => (
          <StyledRadio
            checked={selectedValue === value}
            key={JSON.stringify(value)}
            label={`${label}${details ? ` ${details}` : ''}`}
            name={label}
            onChange={() => onChange(value)}
            value={value}
          />
        ))}
      </Flex>
    </FormFieldWrapper>
  );
};

const StyledRadio = styled(Radio)<{ checked: boolean }>`
  background-color: ${({ checked }) =>
    checked
      ? Colors['surface--interactive--toggled-default']
      : Colors['surface--muted']};
  border: 2px solid
    ${({ checked }) =>
      checked
        ? Colors['border--interactive--toggled-default']
        : Colors['border--interactive--default']};
  border-radius: 6px;
  flex: 1;
  padding: 10px 14px;
`;

export default FormFieldRadioGroup;
