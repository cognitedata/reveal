import { SelectFilterOption } from '@transformations/containers';
import { getContainer } from '@transformations/utils';
import { Select } from 'antd';

import { Flex, Icon, Chip } from '@cognite/cogs.js';

const { Option } = Select;

export type TransformationFilterProps = {
  className?: string;
  placeholder?: string;
  options: SelectFilterOption[];
  onChange: (filter: SelectFilterOption) => void;
  onClear?: () => void;
  value: string | undefined;
};

type TransformationFilterOptionType = {
  children: React.ReactNode;
  label: string;
  value: string;
};

const TransformationFilter = ({
  className,
  options = [],
  onChange,
  onClear,
  value,
  placeholder,
}: TransformationFilterProps): JSX.Element => {
  const handleFilterChange = (selected: string | number) => {
    const selectedFilter = options.find(
      (option) => option?.value === selected
    )!;
    onChange(selectedFilter);
  };

  const handleFilterOptions = (
    input: string,
    option?: TransformationFilterOptionType
  ) => {
    return option?.label
      ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
      : false;
  };

  return (
    <Select<string, TransformationFilterOptionType>
      showSearch
      className={className}
      onChange={handleFilterChange}
      allowClear={!!onClear}
      placeholder={placeholder}
      onClear={onClear}
      getPopupContainer={getContainer}
      filterOption={handleFilterOptions}
      optionFilterProp="children"
      value={value}
      menuItemSelectedIcon={
        <span style={{ verticalAlign: 'middle' }}>
          <Icon type="Checkmark" />
        </span>
      }
      suffixIcon={<Icon type="ChevronDown" />}
    >
      {options?.map((option) => (
        <Option key={option.value} value={option.value} label={option.label}>
          {Number.isFinite(option.count) ? (
            <Flex direction="row" justifyContent="space-between">
              <div>{option.label}</div>
              <div>
                <Chip label={`${option.count}`} size="x-small" type="neutral" />
              </div>
            </Flex>
          ) : (
            option.label
          )}
        </Option>
      ))}
    </Select>
  );
};

export default TransformationFilter;
