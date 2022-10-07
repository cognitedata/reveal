import { useMemo, useState } from 'react';

import { Colors, Icon } from '@cognite/cogs.js';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';

import { Trans, TranslationKeys, useTranslation } from 'common';

const { Option } = Select;

const FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX = 'flow-builder-create-value/';

type SelectWithCreateOption = {
  label: string;
  value: string;
};

type SelectWithCreateProps = {
  onCreate?: (value: string) => void;
  options: SelectWithCreateOption[];
  titleI18nKey: TranslationKeys;
} & Omit<
  SelectProps<string, SelectWithCreateOption>,
  | 'allowClear'
  | 'clearIcon'
  | 'filterOption'
  | 'onSearch'
  | 'options'
  | 'showSearch'
>;

const SelectWithCreate = ({
  onCreate,
  onSelect,
  options,
  titleI18nKey,
  ...selectProps
}: SelectWithCreateProps): JSX.Element => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    return options.filter(({ value }) =>
      value.toLowerCase().includes(lowerCaseSearch)
    );
  }, [options, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSelect = (value: string) => {
    let selectedOption: SelectWithCreateOption | undefined;
    if (value.startsWith(FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX)) {
      const selectedValue = value.split(
        FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX
      )[1];
      selectedOption = { label: selectedValue, value: selectedValue };
      onCreate?.(selectedValue);
    } else {
      selectedOption = options.find(
        ({ value: testValue }) => testValue === value
      );
    }

    if (selectedOption) {
      onSelect?.(value, selectedOption);
    }
  };

  return (
    <Select<string, SelectWithCreateOption>
      allowClear
      clearIcon={<StyledClearIcon type="ClearAll" />}
      filterOption={() => true}
      onSearch={handleSearch}
      onSelect={handleSelect}
      placeholder={t('select-with-create-placeholder', {
        selectLabel: t(titleI18nKey, { postProcess: 'lowercase' }),
      })}
      showSearch
      suffixIcon={<StyledSuffixIcon type="ChevronDown" />}
      {...selectProps}
    >
      {filteredOptions.map(({ label, value }) => (
        <Option
          key={value}
          label={
            <Trans
              components={{ b: <strong /> }}
              i18nKey="select-label-with-colon"
              values={{
                selectLabel: t(titleI18nKey),
                optionLabel: label,
              }}
            />
          }
          value={value}
        >
          {label}
        </Option>
      ))}
      {filteredOptions.length === 0 && (
        <Option
          label={
            <Trans
              components={{ b: <strong /> }}
              i18nKey="select-label-with-colon"
              values={{
                selectLabel: t(titleI18nKey),
                optionLabel: search,
              }}
            />
          }
          value={`${FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX}${search}`}
        >
          <StyledCreateOption>
            <Icon type="Add" />
            {t('select-with-create-option', {
              selectLabel: t(titleI18nKey, { postProcess: 'lowercase' }),
              optionLabel: search,
            })}
          </StyledCreateOption>
        </Option>
      )}
    </Select>
  );
};

const StyledClearIcon = styled(Icon)`
  margin-top: -2px;
`;

const StyledSuffixIcon = styled(Icon)`
  margin-right: -4px;
`;

const StyledCreateOption = styled.div`
  align-items: center;
  color: ${Colors['text-icon--interactive--default']};
  display: flex;
  font-weight: 500;
  gap: 8px;
`;

export default SelectWithCreate;
