import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Select, Popover, Spin } from 'antd';
import { DataSet } from '@cognite/sdk';
import {
  useInfiniteList,
  usePermissions,
} from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';
import { A, Body, Colors } from '@cognite/cogs.js';
import { stringContains } from 'utils';
import { createLink } from '@cognite/cdf-utilities';
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

export const DataSetSelect = ({
  onSelectionChange,
  style = { minWidth: '306px', maxHeight: '36px' },
  disabled = false,
  multiple = false,
  selectedDataSetIds,
  limit = 1000,
  allowClear = false,
}: DataSetSelectProps) => {
  const [currentSelection, setCurrentSelection] = useState([] as number[]);
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

  const setSelectedValue = (ids?: number | number[]) => {
    if (!ids) {
      setCurrentSelection([]);
      onSelectionChange([]);
    } else if (multiple) {
      setCurrentSelection(ids as number[]);
      onSelectionChange(ids as number[]);
    } else {
      setCurrentSelection([ids as number]);
      onSelectionChange([ids as number]);
    }
    setQuery('');
  };

  useEffect(() => {
    if (selectedDataSetIds?.length) {
      setCurrentSelection(selectedDataSetIds);
    }
  }, [selectedDataSetIds]);

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
        <Select style={style} disabled />
      </Popover>
    );
  }
  return (
    <Spin spinning={!!isLoading} size="small">
      <DataSetSelector
        showSearch
        style={style}
        disabled={disabled}
        mode={multiple ? 'multiple' : undefined}
        placeholder="Select data sets"
        value={multiple ? currentSelection : currentSelection[0]}
        onChange={(id: any) => {
          setSelectedValue(id);
          setIsVisible(false);
        }}
        maxTagTextLength={10}
        onSearch={setQuery}
        dropdownMatchSelectWidth
        filterOption={false}
        maxTagCount="responsive"
        onDropdownVisibleChange={setIsVisible}
        open={visible}
        loading={!!isLoading}
        notFoundContent={<Body level={2}>No data sets found</Body>}
        allowClear={allowClear}
      >
        {datasetSearchResults.map((dataset: DataSet) => (
          <Select.Option
            key={dataset.id}
            value={dataset.id}
            label={dataset.name}
          >
            {dataset.name}
          </Select.Option>
        ))}
      </DataSetSelector>
    </Spin>
  );
};

const DataSetSelector = styled(Select)`
  li.ant-select-selection__choice {
    border: 1px solid ${Colors['greyscale-grey7'].hex()};
  }
`;
