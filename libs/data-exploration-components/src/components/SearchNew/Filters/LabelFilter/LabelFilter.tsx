import React from 'react';
import { OptionType, Tooltip } from '@cognite/cogs.js';
import { MultiSelect } from '@data-exploration-components/components';
import { ResourceType } from '@data-exploration-components/types';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { OptionValue } from '../types';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';
import { useAssetsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';

export const LabelFilterV2 = ({
  resourceType,
  value,
  setValue,
  addNilOption,
}: {
  resourceType: ResourceType;
  value: OptionValue<string>[] | undefined;
  setValue: (newValue: OptionValue<string>[] | undefined) => void;
  addNilOption?: boolean;
}) => {
  const trackUsage = useMetrics();

  const allowLabels = resourceType === 'asset' || resourceType === 'file';

  const {
    data: labels = [],
    isError,
    isFetched,
  } = useAssetsUniqueValuesByProperty('labels');

  if (!isFetched) {
    return null;
  }

  const setLabel = (newValue?: OptionType<string>[]) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    setValue(newFilters as OptionValue<string>[]);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.LABEL_FILTER, {
      ...newValue,
      resourceType,
    });
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content="Error fetching labels, please make sure you have labelsAcl:READ"
    >
      <>
        <FilterFacetTitle>Labels</FilterFacetTitle>
        <MultiSelect
          options={labels.map((label) => ({
            label: String(value),
            value: String(label.value),
          }))}
          cogsTheme="grey"
          isDisabled={isError || !allowLabels}
          onChange={setLabel}
          value={value as OptionType<string>[]}
          isMulti
          isSearchable
          isClearable
          addNilOption={addNilOption}
        />
      </>
    </Tooltip>
  );
};
