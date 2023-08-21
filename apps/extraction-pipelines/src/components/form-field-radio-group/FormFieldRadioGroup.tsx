import React from 'react';

import styled from 'styled-components';

import { Colors, Flex, FlexProps, Radio } from '@cognite/cogs.js';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '../form-field-wrapper/FormFieldWrapper';

type FormFieldRadioGroupProps<V> = Omit<FormFieldWrapperProps, 'children'> & {
  direction?: FlexProps['direction'];
  onChange: (value: V) => void;
  options: (FormFieldRadioOption<V> & { content?: React.JSX.Element })[];
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
      <Flex direction={direction} gap={24}>
        {options.map(({ details, label, value, content }) => (
          <Flex direction="column" gap={16} alignItems="stretch">
            <StyledRadio
              checked={selectedValue === value}
              key={JSON.stringify(value)}
              label={`${label}${details ? ` ${details}` : ''}`}
              name={label}
              onChange={() => onChange(value)}
              value={value}
              className="cogs-body-medium strong"
            />
            {value === selectedValue && content}
          </Flex>
        ))}
      </Flex>
    </FormFieldWrapper>
  );
};

const StyledRadio = styled(Radio)<{ checked: boolean }>`
  .cogs-radio__label {
    color: ${Colors['text-icon--strong']};
    font-feature-settings: 'ss04' on;
    font-weight: 500;
    letter-spacing: -0.084px;
  }
`;

export default FormFieldRadioGroup;
