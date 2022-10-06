import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
// import { OptionsType, OptionTypeBase } from 'react-select';
import { Select, ResourceType } from '@cognite/data-exploration';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FilterFacetTitle } from '../FilterFacetTitle';

export const LabelFilter = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType: ResourceType;
  value: { externalId: string }[] | undefined;
  setValue: (newValue: { externalId: string }[] | undefined) => void;
}) => {
  const allowLabels = resourceType === 'asset' || resourceType === 'file';
  const { data: labels = [], isError } = useList<LabelDefinition>(
    'labels',
    { filter: {}, limit: 1000 },
    undefined,
    true
  );

  const currentLabels = (value || [])
    .map(({ externalId }) => labels.find(el => el.externalId === externalId))
    .filter(el => !!el) as LabelDefinition[];

  const setLabel = (ids?: string[]) => {
    const newFilters =
      ids && ids.length > 0
        ? ids.map(externalId => ({ externalId }))
        : undefined;
    setValue(newFilters);
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content="Error fetching labels, please make sure you have labelsAcl:READ"
    >
      <>
        <FilterFacetTitle>Labels</FilterFacetTitle>
        <Select
          options={labels.map(el => ({
            label: el.name,
            value: el.externalId,
          }))}
          isDisabled={isError || !allowLabels}
          onChange={(newValue: any) => {
            setLabel(
              newValue
                ? (newValue as any).map((el: any) => el.value)
                : undefined
            );
          }}
          value={currentLabels?.map(el => ({
            label: el.name,
            value: el.externalId,
          }))}
          isMulti
          isSearchable
          isClearable
        />
      </>
    </Tooltip>
  );
};
