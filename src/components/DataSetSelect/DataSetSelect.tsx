import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Popover } from 'antd';
import { DataSet } from '@cognite/sdk';
import {
  useInfiniteList,
  usePermissions,
} from '@cognite/sdk-react-query-hooks';
import { A, Body, Select } from '@cognite/cogs.js';
import { createLink } from 'utils/URLUtils';
import { stringContains } from 'utils/stringUtils';
import { AppContext } from 'context/AppContext';

export type DataSetSelectProps = {
  onSelectionChange: (ids: number[]) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  multiple?: boolean;
  selectedDataSetIds?: number[];
  limit?: number;
  allowClear?: boolean;
};

type OptionType = {
  value: string;
  label: string;
};
export const DataSetSelect = ({
  onSelectionChange,
  style = { minWidth: '306px', maxHeight: '36px' },
  disabled = false,
  multiple = false,
  selectedDataSetIds,
  limit = 1000,
  allowClear = false,
}: DataSetSelectProps) => {
  const [currentSelection, setCurrentSelection] = useState<
    OptionType | OptionType[]
  >([]);
  const [visible, setIsVisible] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [datasetSearchResults, setDatasetSearchResults] = useState<DataSet[]>(
    []
  );
  const context = useContext(AppContext);
  const { data: canReadDataSets } = usePermissions(
    context?.flow!,
    'datasetsAcl',
    'READ',
    undefined,
    { enabled: !!context?.flow }
  );

  const { isFetching: isLoading, data: listData } = useInfiniteList<DataSet>(
    'datasets',
    limit
  );

  const listItems = useMemo(
    () =>
      listData?.pages?.reduce(
        (accl, t) => accl.concat(t.items),
        [] as DataSet[]
      ),
    [listData]
  );

  const setSelectedValue = (options?: OptionType | OptionType[]) => {
    if (!options) {
      setCurrentSelection([]);
      onSelectionChange([]);
    } else if (multiple && Array.isArray(options)) {
      setCurrentSelection(options);
      onSelectionChange(options.map(option => +option.value));
    } else if (!Array.isArray(options)) {
      setCurrentSelection([options]);
      onSelectionChange([+options]);
    }
    setQuery('');
  };

  useEffect(() => {
    if (selectedDataSetIds?.length) {
      const selectedCurrentDataSelection = datasetSearchResults
        .filter(searchResult =>
          selectedDataSetIds.find(id => id === searchResult.id)
        )
        .map(dataset => ({
          value: `${dataset.id}`,
          label: dataset.name || '',
        }));
      setCurrentSelection(selectedCurrentDataSelection);
    }
  }, [datasetSearchResults, selectedDataSetIds]);

  useEffect(() => {
    const dataSetsFilter = (dataset: DataSet) =>
      !!stringContains(dataset?.name, query);
    const filteredDataSets = listItems?.filter(dataSetsFilter) || [];
    setDatasetSearchResults(filteredDataSets);
  }, [query, listItems]);

  if (!canReadDataSets) {
    return (
      <Popover
        title="Missing DataSetAcl.READ"
        content={
          <Body level={2}>
            Go to{' '}
            <A href={createLink('/access-management')}>Access management</A> to
            enable access to DataSetAcl.READ
          </Body>
        }
      >
        <Select options={[]} disabled />
      </Popover>
    );
  }
  return (
    <Select
      icon="Loader"
      showSearch
      isMulti
      style={style}
      disabled={disabled}
      mode={multiple ? 'multiple' : undefined}
      placeholder="Select data sets"
      value={currentSelection}
      onChange={setSelectedValue}
      maxTagTextLength={10}
      dropdownMatchSelectWidth
      filterOption={false}
      maxTagCount="responsive"
      options={datasetSearchResults.map((dataset: DataSet) => ({
        value: dataset.id.toString(),
        label: dataset.name || '',
      }))}
      onDropdownVisibleChange={setIsVisible}
      open={visible}
      loading={!!isLoading}
      notFoundContent={<Body level={2}>No data sets found</Body>}
      allowClear={allowClear}
    />
  );
};
