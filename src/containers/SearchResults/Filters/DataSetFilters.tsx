import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { Select } from 'components/Common';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { ResourceType } from 'types';
import { Title } from '@cognite/cogs.js';
import { IdEither, DataSet, InternalId } from 'cognite-sdk-v3';
import {
  useResourcesDispatch,
  useResourcesSelector,
} from '@cognite/cdf-resources-store';
import {
  dataSetCounts,
  list,
} from '@cognite/cdf-resources-store/dist/datasets';
import { OptionsType, OptionTypeBase } from 'react-select';
import { RootState } from 'reducers';

export const DataSetFilters = ({
  resourceType,
}: {
  resourceType: ResourceType;
}) => {
  const {
    sequenceFilter,
    setSequenceFilter,
    assetFilter,
    setAssetFilter,
    fileFilter,
    setFileFilter,
    eventFilter,
    setEventFilter,
    timeseriesFilter,
    setTimeseriesFilter,
  } = useContext(ResourceSelectionContext);

  const dispatch = useResourcesDispatch();

  useEffect(() => {
    dispatch(list());
  }, [dispatch]);

  const datasetCounts = useResourcesSelector(dataSetCounts);
  const dataSetMap = useResourcesSelector(
    (state: RootState) => state.datasets.items
  );

  const currentDataSetIds = useMemo(() => {
    switch (resourceType) {
      case 'asset':
        return assetFilter ? assetFilter.dataSetIds || [] : [];
      case 'timeSeries':
        return timeseriesFilter ? timeseriesFilter.dataSetIds || [] : [];
      case 'file':
        return fileFilter ? fileFilter.dataSetIds || [] : [];
      case 'event':
        return eventFilter ? eventFilter.dataSetIds || [] : [];
      case 'sequence':
        return sequenceFilter ? sequenceFilter.dataSetIds || [] : [];
    }
    return [] as IdEither[];
  }, [
    resourceType,
    assetFilter,
    timeseriesFilter,
    fileFilter,
    eventFilter,
    sequenceFilter,
  ]);

  const dataSetIds = useMemo(() => {
    return Object.keys(datasetCounts)
      .map(el => Number(el))
      .filter(key => {
        switch (resourceType) {
          case 'asset':
            return datasetCounts[key].assets !== 0;
          case 'timeSeries':
            return datasetCounts[key].timeseries !== 0;
          case 'file':
            return datasetCounts[key].files !== 0;
          case 'event':
            return datasetCounts[key].events !== 0;
          case 'sequence':
            return datasetCounts[key].sequences !== 0;
        }
        return [];
      });
  }, [resourceType, datasetCounts]);

  const dataSets = dataSetIds
    .map(el => dataSetMap[el])
    .filter(el => !!el) as DataSet[];

  const currentDataSets = currentDataSetIds
    .map(el => dataSetMap[(el as InternalId).id])
    .filter(el => !!el) as DataSet[];

  const setDataSetFilter = useCallback(
    (ids: number[]) => {
      const newFilters = ids.map(id => ({ id }));
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

  return (
    <>
      <Title level={4} style={{ marginBottom: 12 }} className="title">
        Metadata filters
      </Title>
      <Select
        options={dataSets.map(el => ({ label: el.name, value: el.id }))}
        onChange={value => {
          setDataSetFilter(
            value
              ? (value as OptionsType<OptionTypeBase>).map(el => el.value)
              : []
          );
        }}
        value={currentDataSets.map(el => ({ label: el.name, value: el.id }))}
        isMulti
        isSearchable
        isClearable
      />
    </>
  );
};
