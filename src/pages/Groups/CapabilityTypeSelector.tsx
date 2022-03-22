import React, { ReactNode } from 'react';
import styled from 'styled-components';

import Select from 'antd/lib/select';

import { getContainer } from 'utils/utils';
import {
  getAclType,
  getCapabilityTypeGroups,
  getCapabilityFormattedName,
  getCapabilityDescription,
} from './utils';

declare module 'antd/lib/select' {
  export interface OptionProps {
    label?: string | ReactNode;
  }
}

interface CapabilityTypeSelectorProps {
  value: string;
  onChange(value: string): void;
}

const CapabilityLabel = styled.span`
  font-weight: bold;
`;

const Capability = styled.div`
  display: flex;
  align-items: center;
  margin: 5px 0;
`;

const CapabilityName = styled.div`
  width: 25%;
  white-space: normal;
  padding-left: 10px;
`;

const CapabilityDescription = styled.div`
  width: 75%;
  font-weight: normal;
  white-space: normal;
`;

const CapabilityTypeSelector = (props: CapabilityTypeSelectorProps) => {
  const { value, onChange } = props;

  const capabilityTypeGroups = getCapabilityTypeGroups();

  const { OptGroup, Option } = Select;

  const optionGroups = capabilityTypeGroups.map((group) => {
    return (
      <OptGroup key={group.name} label={group.name}>
        {group.items.map((item) => {
          const aclType = getAclType(item);
          const formattedName = getCapabilityFormattedName(item);
          const description = getCapabilityDescription(item);
          return (
            <Option key={formattedName} value={aclType} label={formattedName}>
              <Capability>
                <CapabilityName>
                  <CapabilityLabel>{formattedName}</CapabilityLabel>
                </CapabilityName>
                <CapabilityDescription>{description}</CapabilityDescription>
              </Capability>
            </Option>
          );
        })}
      </OptGroup>
    );
  });

  const handleFilter = (input: string, option: any) => {
    const shouldBeIncluded =
      option.children &&
      (option.label.toLowerCase().includes(input.toLowerCase()) ||
        option.value.toLowerCase().includes(input.toLowerCase()));
    return shouldBeIncluded;
  };

  return (
    <Select
      value={value}
      onChange={onChange}
      showSearch
      optionLabelProp="label"
      getPopupContainer={getContainer}
      filterOption={handleFilter}
    >
      {optionGroups}
    </Select>
  );
};

export default CapabilityTypeSelector;
