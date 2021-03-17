import React, { useState, useEffect, useMemo } from 'react';
import { Select, Popover } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DataSet } from '@cognite/sdk';
import {
  list,
  selectAllDataSets,
  dataSetCounts,
  getIsFetchingDatasets,
  datasetsFetched,
} from 'modules/datasets';
import { ResourceType } from 'modules/sdk-builder/types';
import { checkPermission } from 'modules/app';
import styled from 'styled-components';
import { Body, Colors, Tooltip } from '@cognite/cogs.js';
import {
  truncateString,
  stringContains,
} from 'modules/contextualization/utils';
import Spin from 'antd/lib/spin';

type Props = {
  onDataSetSelected: (ids: number[]) => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  multiple?: boolean;
  selectedDataSetIds?: number[];
  resourceType: ResourceType;
  noTypeCheck?: boolean;
};

const DataSetSelect = ({
  onDataSetSelected,
  style = { minWidth: '306px', maxHeight: '36px' },
  disabled = false,
  multiple = false,
  noTypeCheck = false,
  selectedDataSetIds,
  resourceType,
}: Props) => {
  const dispatch = useDispatch();

  const [currentSelection, setCurrentSelection] = useState([] as number[]);
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState<boolean>(false);
  const [datasetSearchResults, setDatasetSearchResults] = useState(
    [] as DataSet[]
  );

  const datasets = useSelector(selectAllDataSets);
  const dataSetResourceCounts = useSelector(dataSetCounts);
  const isLoading = useSelector(getIsFetchingDatasets);
  const isLoaded = useSelector(datasetsFetched);

  const setSelectedValue = (ids?: number | number[]) => {
    if (!ids) {
      setCurrentSelection([]);
      onDataSetSelected([]);
    } else if (multiple) {
      setCurrentSelection(ids as number[]);
      onDataSetSelected(ids as number[]);
    } else {
      setCurrentSelection([ids as number]);
      onDataSetSelected([ids as number]);
    }
    setQuery('');
  };

  useEffect(() => {
    const dataSetsFilter = (dataset: DataSet) => {
      const containsQuery = stringContains(dataset?.name, query);
      const containsData = dataSetResourceCounts[dataset.id][resourceType] > 0;
      return resourceType && containsQuery && containsData;
    };
    const filter = datasets.filter(dataSetsFilter);
    setDatasetSearchResults(filter);
  }, [query, datasets, resourceType, dataSetResourceCounts, noTypeCheck]);

  useEffect(() => {
    if (selectedDataSetIds) {
      setCurrentSelection(selectedDataSetIds);
    }
  }, [selectedDataSetIds]);

  useEffect(() => {
    if (!isLoaded) {
      dispatch(list({}));
      setVisible(false);
    }
  }, [dispatch, noTypeCheck, isLoaded]);

  const getPermission = useMemo(
    () => checkPermission('datasetsAcl', 'READ'),
    []
  );
  const canReadDataSets = useSelector(getPermission);

  if (!canReadDataSets) {
    return (
      <Popover
        title="Missing DataSetAcl.READ"
        content="Go to Access management to enable access to DataSetAcl.READ"
      >
        <Select style={style} disabled />
      </Popover>
    );
  }

  const renderTagLabel = (id: number, name?: string, concat?: boolean) => (
    <Tooltip
      placement="left"
      content={
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bolder' }}>{name}</div>
          <div>{id}</div>
        </div>
      }
    >
      <Body level={2}>{concat && name ? truncateString(name, 14) : name}</Body>
    </Tooltip>
  );

  return (
    <Spin spinning={!!isLoading} size="small">
      <DataSetSelector
        showSearch
        style={style}
        disabled={disabled}
        mode={multiple ? 'multiple' : 'default'}
        placeholder="Select data sets"
        value={multiple ? currentSelection : currentSelection[0]}
        onChange={(id: any) => {
          setSelectedValue(id);
          setVisible(false);
        }}
        onSearch={setQuery}
        dropdownMatchSelectWidth
        filterOption={false}
        maxTagCount={1}
        optionLabelProp="label"
        onDropdownVisibleChange={setVisible}
        open={visible}
        loading={!!isLoading}
      >
        {datasetSearchResults.map((dataset: DataSet) => (
          <Select.Option
            key={dataset.id}
            value={dataset.id}
            label={renderTagLabel(dataset.id, dataset?.name, true)}
          >
            {renderTagLabel(dataset.id, dataset?.name, false)}
          </Select.Option>
        ))}
      </DataSetSelector>
    </Spin>
  );
};

export default DataSetSelect;

const DataSetSelector = styled(Select)`
  li.ant-select-selection__choice {
    border: 1px solid ${Colors['greyscale-grey7'].hex()};
  }
`;
