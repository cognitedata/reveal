import React from 'react';
import { Body, Tooltip } from '@cognite/cogs.js';
import { DataSet, IdEither } from '@cognite/sdk';
import { OptionsType, OptionTypeBase } from 'react-select';
import { MultiSelect } from '@data-exploration-components/components';
import {
  ResourceType,
  convertResourceType,
} from '@data-exploration-components/types';
import {
  useRelevantDatasets,
  DataSetWCount,
} from '@data-exploration-components/hooks/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

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
      ids && ids.length > 0 ? ids.map((id) => ({ id })) : undefined;
    setValue(newFilters);
  };

  const { data: validDatasets, isError } = useRelevantDatasets(
    convertResourceType(resourceType)
  );
  const formatOption = (dataset: DataSetWCount) => {
    const name = dataset?.name || '';
    const label = name.length > 0 ? name : `${dataset.id}`;
    return {
      label: `${label}${dataset.count ? ` (${dataset.count})` : ''}`,
      value: dataset.id,
    };
  };

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
        <Body
          level={4}
          style={{ marginBottom: 5, marginTop: 10 }}
          className="title"
        >
          Data set
        </Body>
        <MultiSelect
          options={validDatasets?.map(formatOption) || []}
          isDisabled={isError}
          onChange={(newValue) => {
            setDataSetFilter(
              newValue
                ? (newValue as OptionsType<OptionTypeBase>).map(
                    (el) => el.value
                  )
                : undefined
            );
          }}
          value={currentDataSets?.map((el) => ({
            label: String(el.name),
            value: el.id,
          }))}
          isMulti
          isSearchable
          isClearable
        />
      </>
    </Tooltip>
  );
};
