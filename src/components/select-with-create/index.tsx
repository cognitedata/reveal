import { useMemo, useState } from 'react';

import { Colors, Icon } from '@cognite/cogs.js';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';

import { Trans, TranslationKeys, useTranslation } from 'common';

const { Option } = Select;

const FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX = 'flow-builder-create-value/';

export type SelectWithCreateOption<V> = {
  label: string;
  value: V;
};

type SelectWithCreateProps<V> = {
  onCreate?: (labelToCreate: string) => void;
  onSelect?: (value: V, option: SelectWithCreateOption<V>) => void;
  options: SelectWithCreateOption<V>[];
  titleI18nKey: TranslationKeys;
} & Omit<
  SelectProps<V, SelectWithCreateOption<V>>,
  | 'allowClear'
  | 'clearIcon'
  | 'filterOption'
  | 'labelInValue'
  | 'onSearch'
  | 'onSelect'
  | 'options'
  | 'showSearch'
>;

const SelectWithCreate = <V extends string | number = string>({
  disabled,
  loading,
  onCreate,
  onSelect,
  options,
  titleI18nKey,
  ...selectProps
}: SelectWithCreateProps<V>): JSX.Element => {
  const { t } = useTranslation();

  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    return options.filter(({ label }) =>
      label.toLowerCase().includes(lowerCaseSearch)
    );
  }, [options, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleSelect = (value: V) => {
    if (
      typeof value === 'string' &&
      value.startsWith(FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX)
    ) {
      const labelToCreate = value.split(
        FLOW_BUILDER_CREATE_OPTION_VALUE_PREFIX
      )[1];
      onCreate?.(labelToCreate);
    } else {
      const selectedOption: SelectWithCreateOption<V> | undefined =
        options.find(({ value: testValue }) => testValue === value);
      if (selectedOption) {
        onSelect?.(value, selectedOption);
      }
    }
  };

  return (
    <Select<V, SelectWithCreateOption<V>>
      allowClear
      clearIcon={<StyledClearIcon type="ClearAll" />}
      disabled={disabled || loading}
      filterOption={() => true}
      labelInValue={false}
      onSelect={handleSelect as any} // we can cast to any as long as `labelInValue` is false
      onSearch={handleSearch}
      placeholder={t('select-with-create-placeholder', {
        selectLabel: t(titleI18nKey, { postProcess: 'lowercase' }),
      })}
      showSearch
      suffixIcon={
        <StyledSuffixIcon type={loading ? 'Loader' : 'ChevronDown'} />
      }
      virtual={false}
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
      {filteredOptions.length === 0 && search.length > 3 && (
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
