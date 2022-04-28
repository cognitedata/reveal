import styled from 'styled-components';

import { Flex, Select, SegmentedControl, OptionType } from '@cognite/cogs.js';
import { useEffect, useState } from 'react';
import { BuiltInType, SolutionDataModelField } from '@platypus/platypus-core';
import { groupOptions } from './utils';

type OptionValue = {
  value: string;
  label: string;
  isList: boolean;
};

type TypeSelectProps = {
  disabled: boolean;
  field: SolutionDataModelField;
  builtInTypes: BuiltInType[];
  customTypesNames: string[];
  onValueChanged: (value: OptionValue) => void;
};
export const TypeSelect = ({
  builtInTypes,
  customTypesNames,
  disabled,
  field,
  onValueChanged,
}: TypeSelectProps) => {
  const [currentKey, setCurrentKey] = useState(
    field.type.list ? 'list' : 'single'
  );

  const [optionsToShow, setOptionsToShow] = useState<OptionType<string>[]>([]);

  useEffect(() => {
    setOptionsToShow(
      groupOptions(builtInTypes, customTypesNames, currentKey === 'list')
    );
  }, [builtInTypes, customTypesNames, currentKey]);
  const curFieldValue = {
    label: field.type.list ? `[${field.type.name}] list` : field.type.name,
    value: field.type.name,
    isList: field.type.list,
  };
  return (
    <div data-cy={`select-${field.type.name}`}>
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
        options={optionsToShow}
        value={curFieldValue}
        onChange={(option: OptionValue) => onValueChanged(option)}
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
