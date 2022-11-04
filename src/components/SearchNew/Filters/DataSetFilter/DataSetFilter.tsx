import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';
import { Select } from 'components';
import { ResourceType, convertResourceType } from 'types';
import { DataSetWCount } from 'hooks/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { useResourceTypeDataSetAggregate } from 'domain/dataSets/internal/hooks/useResourceTypeDataSetAggregate';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { isArray } from 'lodash';
import { OptionValue } from '../types';

const formatOption = (dataset: DataSetWCount) => {
  const name = dataset?.name || '';
  const label = name.length > 0 ? name : `${dataset.id}`;
  return {
    label: `${label}${dataset.count ? ` (${dataset.count})` : ''}`,
    value: dataset.id,
  };
};

export const DataSetFilterV2 = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType?: ResourceType;
  value?: number[];
  setValue: (newValue: OptionValue<number>[] | undefined) => void;
}) => {
  const { data: currentDataSets } = useCdfItems<DataSet>(
    'datasets',
    (value || []).map(id => ({ id })),
    false,
    {
      enabled: value && value.length > 0,
    }
  );

  const setDataSetFilter = (newValue?: OptionValue<number>[]) => {
    // const newFilters =
    //   ids && ids.length > 0 ? ids?.map(id => ({ id })) : undefined;
    setValue(newValue);
  };

  const { data: datasetOptions, isError } = useResourceTypeDataSetAggregate(
    resourceType ? convertResourceType(resourceType) : undefined
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
            if (isArray(newValue)) {
              setDataSetFilter(
                newValue && newValue.length > 0 ? newValue : undefined
              );
            }
          }}
          value={currentDataSets?.map(el => ({ label: el.name, value: el.id }))}
          isMulti
          isSearchable
          isClearable
          menuPosition="fixed"
          cogsTheme="grey"
        />
      </>
    </Tooltip>
  );
};
