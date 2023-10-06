import React, { useState, useEffect } from 'react';

import isEqual from 'lodash/isEqual';

import { OptionType } from '@cognite/cogs.js';
import { DataSet } from '@cognite/sdk';

import { useDatasets, useSelectFilter } from '../../../hooks';
import { ResourceType } from '../../../modules/sdk-builder/types';
import { stringContains } from '../../../utils/utils';
import { Select } from '../../Common';

type Props = {
  resourceType: ResourceType;
  selectedDataSetIds?: number[];
  onDataSetSelected: (ids: number[]) => void;
  'data-cy'?: string;
};

export const DataSetSelect = (props: Props) => {
  const { resourceType, selectedDataSetIds, onDataSetSelected, ...rest } =
    props;
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<OptionType<React.ReactText>[]>();
  const [datasetSearchResults, setDatasetSearchResults] = useState(
    [] as DataSet[]
  );
  const { datasets, dataSetResourceCounts, isLoaded } = useDatasets();

  const { currentSelection, setMultiSelection } = useSelectFilter<number>(
    isLoaded,
    options,
    selectedDataSetIds,
    onDataSetSelected,
    setQuery
  );

  const showNotEmptyDatasets = () => {
    const dataSetsFilter = (dataset: DataSet) => {
      if (!dataSetResourceCounts) return false;
      const containsQuery = stringContains(dataset?.name, query);
      const containsData = dataSetResourceCounts[dataset.id][resourceType] > 0;
      return resourceType && containsQuery && containsData;
    };
    const filter = datasets.filter(dataSetsFilter);
    if (!isEqual(filter, datasetSearchResults)) setDatasetSearchResults(filter);
  };
  const prepareOptions = () => {
    const newOptions = datasetSearchResults.map(
      (dataset: DataSet): OptionType<React.ReactText> => ({
        label: dataset?.name ?? dataset.externalId ?? String(dataset?.id),
        value: dataset?.id,
      })
    );
    if (!isEqual(options, newOptions)) setOptions(newOptions);
  };

  useEffect(() => {
    if (!isLoaded) return;
    showNotEmptyDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSetResourceCounts, datasets, query, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    prepareOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, datasetSearchResults]);

  return (
    <Select
      tooltipProps={{
        isLoaded,
      }}
      selectProps={{
        isMulti: true,
        clearable: false,
        title: 'Data set:',
        options: options!,
        value: currentSelection,
        'data-cy': `${rest['data-cy']}`,
        onChange: setMultiSelection,
      }}
    />
  );
};
