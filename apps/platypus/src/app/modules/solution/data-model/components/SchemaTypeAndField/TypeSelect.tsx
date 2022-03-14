import styled from 'styled-components';

import { Flex, Select, SegmentedControl } from '@cognite/cogs.js';
import { useState } from 'react';
import { SolutionDataModelField } from '@platypus/platypus-core';

const groupOptions = (options: string[]) => [
  {
    label: '',
    options: [
      { value: 'Boolean', label: 'Boolean' },
      { value: 'Float', label: 'Float' },
      { value: 'ID', label: 'ID' },
      { value: 'Int', label: 'Int' },
      { value: 'String', label: 'String', divider: true },
    ],
  },
  {
    label: 'Schema Types',
    options: options.map((option) => ({
      value: `${option}`,
      label: `${option}`,
    })),
  },
];

const groupOptionsPlural = (options: string[]) => [
  {
    label: '',
    options: [
      { value: '[Boolean]', label: '[Boolean] list' },
      { value: '[Float]', label: '[Float] list' },
      { value: '[ID]', label: '[ID] list' },
      { value: '[Int]', label: '[Int] list' },
      { value: '[String]', label: '[String] list', divider: true },
    ],
  },
  {
    label: 'Schema Types',
    options: options.map((option) => ({
      value: `[${option}]`,
      label: `[${option}] list`,
    })),
  },
];

type OptionValue = {
  value: string;
  label: string;
};

type TypeSelectProps = {
  disabled: boolean;
  field: SolutionDataModelField;
  options: string[];
  onValueChanged: (value: string) => void;
};
export const TypeSelect = ({
  options,
  disabled,
  field,
  onValueChanged,
}: TypeSelectProps) => {
  const [currentKey, setCurrentKey] = useState(
    field.type.list ? 'list' : 'single'
  );

  const fullSelectOptions = groupOptions(options);
  const fullSelectOptionsPlural = groupOptionsPlural(options);
  const currentOptions =
    currentKey === 'list' ? fullSelectOptionsPlural : fullSelectOptions;

  const curFieldValue = {
    label: field.type.list ? `[${field.type.name}] list` : field.type.name,
    value: field.type.list ? `[${field.type.name}]` : field.type.name,
  };

  return (
    <div data-cy={field.type.name}>
      <Select
        disabled={disabled}
        dropdownRender={(menu) => (
          <div>
            <Flex
              justifyContent="space-between"
              alignItems="center"
              style={{ paddingLeft: 10, paddingRight: 10 }}
            >
              <SelectLabel>Primitives</SelectLabel>
              <SegmentedControl
                currentKey={currentKey}
                onButtonClicked={setCurrentKey}
                size="small"
              >
                <SegmentedControl.Button
                  key="single"
                  icon="RemoveLarge"
                  aria-label="Single type"
                />
                <SegmentedControl.Button
                  key="list"
                  icon="List"
                  aria-label="List type"
                />
              </SegmentedControl>
            </Flex>
            <div>{menu}</div>
          </div>
        )}
        options={currentOptions}
        value={curFieldValue}
        onChange={(option: OptionValue) => onValueChanged(option.value)}
        isOptionSelected={(option: OptionValue) =>
          option.value === field.type.name
        }
        closeMenuOnSelect
      />
    </div>
  );
};

const SelectLabel = styled.span`
  font-size: 10.5px;
  color: rgb(153, 153, 153);
  text-transform: uppercase;
  font-weight: 500;
`;
