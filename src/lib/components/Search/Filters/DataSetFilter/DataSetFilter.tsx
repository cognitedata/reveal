import React from 'react';
import { Title, Tooltip } from '@cognite/cogs.js';
import { DataSet, IdEither } from '@cognite/sdk';
import { OptionsType, OptionTypeBase } from 'react-select';
import { Select } from 'lib/components';
import { ResourceType, convertResourceType } from 'lib/types';
import { useRelevantDatasets, DataSetWCount } from 'lib/hooks/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { usePermissions } from 'lib/hooks/CustomHooks';

export const DataSetFilter = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType: ResourceType;
  value: IdEither[] | undefined;
  setValue: (newValue: IdEither[] | undefined) => void;
}) => {
  const hasPermissions = usePermissions('datasetsAcl', 'READ');
  const { data: currentDataSets } = useCdfItems<DataSet>(
    'datasets',
    value || [],
    {
      enabled: value && value.length > 0,
    }
  );
  const setDataSetFilter = (ids?: number[]) => {
    const newFilters =
      ids && ids.length > 0 ? ids.map(id => ({ id })) : undefined;
    setValue(newFilters);
  };

  const validDatasets = useRelevantDatasets(convertResourceType(resourceType));
  const formatOption = (dataset: DataSetWCount) => {
    const name = dataset?.name || '';
    const label = name.length > 0 ? name : `${dataset.id}`;
    return {
      label: `${label} (${dataset.count})`,
      value: dataset.id,
    };
  };

  return (
    <Tooltip
      interactive
      disabled={hasPermissions}
      content="You do not have access to data sets, please make sure you have datasetsAcl:READ"
    >
      <>
        <Title level={4} style={{ marginBottom: 12 }} className="title">
          Data set
        </Title>
        <Select
          options={validDatasets?.map(formatOption)}
          isDisabled={!hasPermissions}
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
        />
      </>
    </Tooltip>
  );
};
