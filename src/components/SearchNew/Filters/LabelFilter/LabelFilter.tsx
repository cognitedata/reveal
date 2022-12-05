import React from 'react';
import { OptionType, Tooltip } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { MultiSelect } from 'components';
import { ResourceType } from 'types';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { OptionValue } from '../types';
import { useMetrics } from 'hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from 'constants/metrics';

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
  const { data: labels = [], isError } = useList<LabelDefinition>(
    'labels',
    { filter: {}, limit: 1000 },
    undefined,
    true
  );

  // const currentLabels = (value || [])
  //   .map(({ value }) => labels.find(el => el.externalId === value))
  //   .filter(el => !!el) as LabelDefinition[];

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
          options={labels.map(el => ({
            label: el.name,
            value: el.externalId,
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
