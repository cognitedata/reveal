import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { DataSet, IdEither } from '@cognite/sdk';
import { OptionsType, OptionTypeBase } from 'react-select';
import { Select } from 'components';
import { ResourceType, convertResourceType } from 'types';
import { DataSetWCount } from 'hooks/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { useResourceTypeDataSetAggregate } from 'domain/dataSets/internal/hooks/useResourceTypeDataSetAggregate';
import { FilterFacetTitle } from '../FilterFacetTitle';

const formatOption = (dataset: DataSetWCount) => {
  const name = dataset?.name || '';
  const label = name.length > 0 ? name : `${dataset.id}`;
  return {
    label: `${label}${dataset.count ? ` (${dataset.count})` : ''}`,
    value: dataset.id,
  };
};

export const DataSetFilter = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType: ResourceType;
  value: IdEither[] | undefined;
  setValue: (newValue: IdEither[] | undefined) => void;
}) => {
  const { data: currentDataSets } = useCdfItems<DataSet>(
    'datasets',
    value || [],
    false,
    {
      enabled: value && value.length > 0,
    }
  );

  const setDataSetFilter = (ids?: number[]) => {
    const newFilters =
      ids && ids.length > 0 ? ids?.map(id => ({ id })) : undefined;
    setValue(newFilters);
  };

  const { data: datasetOptions, isError } = useResourceTypeDataSetAggregate(
    convertResourceType(resourceType)
  );

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={
        isError &&
        'Error fetching datasets, please make sure you have datasetsAcl:READ'
      }
    >
      <>
        <FilterFacetTitle>Data set</FilterFacetTitle>
        <Select
          options={datasetOptions?.map(formatOption)}
          isDisabled={isError}
          onChange={newValue => {
            setDataSetFilter(
              newValue
                ? (newValue as OptionsType<OptionTypeBase>).map(el => el.value)
                : undefined
            );
          }}
          value={currentDataSets?.map(el => ({ label: el.name, value: el.id }))}
          isMulti
          isSearchable
          isClearable
          menuPosition="fixed"
        />
      </>
    </Tooltip>
  );
};
