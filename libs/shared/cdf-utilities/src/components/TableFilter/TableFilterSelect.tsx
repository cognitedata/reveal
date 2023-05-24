import React, { Key, useRef } from 'react';
import { Icon } from '@cognite/cogs.js';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';

const { Option } = Select;

export type TableFilterSelectOption = {
  label: string;
  value: string;
};

export type TableFilterSelectProps = {
  key: Key;
  className?: string;
  title: string;
  options: TableFilterSelectOption[];
  onChange: (filter: TableFilterSelectOption) => void;
  value: string;
} & SelectProps;

export const TableFilterSelect = ({
  className,
  title,
  options = [],
  onChange,
  value,
  ...props
}: TableFilterSelectProps): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);

  const handleFilterChange = (selected: unknown) => {
    const selectedFilter = options.find(
      (option) => option?.value === selected
    )!;
    onChange(selectedFilter);
  };

  const handleFilterOptions = (input: string, option: any) =>
    option.children.toLowerCase().includes(input.toLowerCase());

  return (
    <div ref={ref}>
      <StyledSelect
        showSearch
        className={className}
        onChange={handleFilterChange}
        getPopupContainer={() => ref.current!}
        // TODO(DOG-269): According to the types, handleFilterOptions shouldn't work
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filterOption={handleFilterOptions}
        optionFilterProp="children"
        optionLabelProp="label"
        value={value}
        menuItemSelectedIcon={
          <span style={{ verticalAlign: 'middle' }}>
            <Icon type="Checkmark" />
          </span>
        }
        suffixIcon={<Icon type="ChevronDown" />}
        {...props}
      >
        {options?.map((option) => (
          <Option
            key={option.value}
            value={option.value}
            label={`${title}: ${option.label}`}
          >
            {option.label}
          </Option>
        ))}
      </StyledSelect>
    </div>
  );
};

const StyledSelect = styled(Select)`
  width: 100%;
`;
