import styled from 'styled-components';

import { Infobar } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  InternalAssetFilters,
  InternalDocumentFilter,
  useDebouncedState,
  useMetrics,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useAssetsFilterOptions,
  useDocumentsLabelsFilterOptions,
  useOptionsWithLabelName,
} from '@data-exploration-lib/domain-layer';

import { MultiSelectFilter } from '../MultiSelectFilter';
import { BaseMultiSelectFilterProps, MultiSelectOptionType } from '../types';

interface Props<TFilter> extends BaseMultiSelectFilterProps<TFilter> {
  options: MultiSelectOptionType<string>[];
}

export const LabelFilter = <TFilter,>({
  options,
  onChange,
  value,
  addNilOption,
  onInputChange,
  isError,
  isLoading,
}: Props<TFilter>) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const handleChange = (
    newValue: {
      label: string;
      value: string;
    }[]
  ) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.AGGREGATE_FILTER, {
      value: newFilters,
      title: 'Label Filter',
    });
  };

  return (
    <MultiSelectFilter<string>
      label={t('LABELS', 'Labels')}
      isLoading={isLoading}
      isError={isError}
      options={options}
      onChange={(_, newValue) => handleChange(newValue)}
      onInputChange={onInputChange}
      value={value}
      isMulti
      isSearchable
      isClearable
      addNilOption={addNilOption}
      menuListFooter={
        <FooterInfoBar>
          {t('LABEL_MENU_FOOTER', 'Tip: Search for Labels is case sensitive')}
        </FooterInfoBar>
      }
    />
  );
};

const AssetLabelFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useAssetsFilterOptions({
    property: 'labels',
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  const optionsWithLabelName = useOptionsWithLabelName(options);

  return (
    <LabelFilter
      {...props}
      onInputChange={setQuery}
      isError={isError}
      isLoading={isLoading}
      options={optionsWithLabelName}
    />
  );
};

export const DocumentLabelFilter = (
  props: BaseMultiSelectFilterProps<InternalDocumentFilter>
) => {
  const [query, setQuery] = useDebouncedState<string>();

  const { options, isLoading, isError } = useDocumentsLabelsFilterOptions({
    searchQuery: props.query,
    filter: props.filter,
    query,
  });

  const optionsWithLabelName = useOptionsWithLabelName(options);

  return (
    <LabelFilter
      {...props}
      onInputChange={setQuery}
      options={optionsWithLabelName}
      isError={isError}
      isLoading={isLoading}
    />
  );
};

LabelFilter.Asset = AssetLabelFilter;
LabelFilter.File = DocumentLabelFilter;

const FooterInfoBar = styled(Infobar).attrs({ type: 'warning' })`
  border-radius: 6px;
  border: 1px solid rgba(255, 187, 0, 0.2);
`;
