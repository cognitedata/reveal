import React, { useCallback, useContext } from 'react';
import { Title, Tooltip } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';
import { OptionsType, OptionTypeBase } from 'react-select';
import { Select } from 'lib/components';
import { ResourceSelectionContext, useResourceFilter } from 'lib/context';
import { ResourceType, convertResourceType } from 'lib/types';
import { useRelevantDatasets, DataSetWCount } from 'lib/hooks/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { usePermissions } from 'lib/hooks/CustomHooks';

export const DataSetFilter = ({
  resourceType,
}: {
  resourceType: ResourceType;
}) => {
  const hasPermissions = usePermissions('datasetsAcl', 'READ');
  const filter = useResourceFilter(resourceType);
  const currentDataSetIds = filter?.dataSetIds || [];
  const { data: currentDataSets } = useCdfItems<DataSet>(
    'datasets',
    currentDataSetIds,
    { enabled: currentDataSetIds && currentDataSetIds.length > 0 }
  );

  const {
    setSequenceFilter,
    setAssetFilter,
    setFileFilter,
    setEventFilter,
    setTimeseriesFilter,
  } = useContext(ResourceSelectionContext);

  const setDataSetFilter = useCallback(
    (ids?: number[]) => {
      const newFilters =
        ids && ids.length > 0 ? ids.map(id => ({ id })) : undefined;
      switch (resourceType) {
        case 'asset':
          setAssetFilter(currentFilter => ({
            ...currentFilter,
            dataSetIds: newFilters,
          }));
          break;
        case 'timeSeries':
          setTimeseriesFilter(currentFilter => ({
            ...currentFilter,
            dataSetIds: newFilters,
          }));
          break;
        case 'event':
          setEventFilter(currentFilter => ({
            ...currentFilter,
            dataSetIds: newFilters,
          }));
          break;
        case 'file':
          setFileFilter(currentFilter => ({
            ...currentFilter,
            dataSetIds: newFilters,
          }));
          break;
        case 'sequence':
          setSequenceFilter(currentFilter => ({
            ...currentFilter,
            dataSetIds: newFilters,
          }));
      }
    },
    [
      resourceType,
      setAssetFilter,
      setTimeseriesFilter,
      setEventFilter,
      setFileFilter,
      setSequenceFilter,
    ]
  );

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
          onChange={value => {
            setDataSetFilter(
              value
                ? (value as OptionsType<OptionTypeBase>).map(el => el.value)
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
