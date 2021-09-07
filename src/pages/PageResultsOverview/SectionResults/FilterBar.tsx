import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { Flex, LoadingSkeleton } from 'components/Common';
import {
  DataSetSelect,
  LabelSelect,
  MimeTypeSelect,
  StatusSelect,
  StatusType,
  FilterList,
} from 'components/Filters';
import { SelectionFilter } from './types';

type Props = {
  showLoadingSkeleton: boolean;
  selectionFilter: SelectionFilter;
  setSelectionFilter: (selectionFilter: SelectionFilter) => void;
};
export default function FilterBar(props: Props) {
  const { showLoadingSkeleton, selectionFilter, setSelectionFilter } = props;

  const [nameQuery, setNameQuery] = useState<string>('');
  const [dataSetIds, setDataSetIds] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusType[]>([]);
  const [fileType, setFileType] = useState<string>('application/pdf');

  const onNameChange = useCallback(
    (e: any) => setNameQuery(e.target.value),
    []
  );
  const onDataSetSelected = useCallback(
    (ids: number[]) => setDataSetIds(ids),
    []
  );
  const onMimeTypeSelected = useCallback(
    (mimeType: string[]) => setFileType(mimeType[0]),
    []
  );
  const onLabelsSelected = useCallback(
    (selectedLabels: string[]) => setLabels(selectedLabels),
    []
  );

  const onQueryClear = () => setNameQuery('');
  const onClearAll = () => {
    setNameQuery('');
    setDataSetIds([]);
    setFileType('');
    setStatus([]);
    setLabels([]);
  };

  useEffect(() => {
    const newFilter = {
      ...selectionFilter,
      nameQuery,
      dataSetIds,
      labels,
      status,
      fileType,
    };
    setSelectionFilter(newFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameQuery, dataSetIds, labels, status, fileType]);

  return (
    <FilterBarWrapper column>
      <FilterSelectsWrapper row>
        <LoadingSkeleton
          loading={showLoadingSkeleton}
          width="250px"
          height="20px"
        >
          <Input
            placeholder="Filter by name"
            style={{ width: '250px' }}
            value={nameQuery}
            onChange={onNameChange}
          />
        </LoadingSkeleton>
        <LoadingSkeleton
          loading={showLoadingSkeleton}
          width="220px"
          height="20px"
        >
          <DataSetSelect
            resourceType="files"
            onDataSetSelected={onDataSetSelected}
          />
        </LoadingSkeleton>
        <LoadingSkeleton
          loading={showLoadingSkeleton}
          width="220px"
          height="20px"
        >
          <LabelSelect
            selectedLabels={labels}
            onLabelsSelected={onLabelsSelected}
          />
        </LoadingSkeleton>
        <LoadingSkeleton
          loading={showLoadingSkeleton}
          width="220px"
          height="20px"
        >
          <MimeTypeSelect
            selectedMimeType={[fileType]}
            onMimeTypeSelected={onMimeTypeSelected}
            loaded
            isMulti
          />
        </LoadingSkeleton>
        <LoadingSkeleton
          loading={showLoadingSkeleton}
          width="220px"
          height="20px"
        >
          <StatusSelect statusType={status} setStatusType={setStatus} />
        </LoadingSkeleton>
      </FilterSelectsWrapper>
      {!showLoadingSkeleton && (
        <FilterList
          labels={labels.map((label: string) => ({ externalId: label }))}
          dataSetIds={dataSetIds}
          onDataSetsChange={onDataSetSelected}
          onLabelsChange={onLabelsSelected}
          searchQuery={nameQuery}
          mimeType={fileType}
          onMimeTypeChange={onMimeTypeSelected}
          onQueryClear={onQueryClear}
          onClearAll={onClearAll}
        />
      )}
    </FilterBarWrapper>
  );
}

const FilterBarWrapper = styled(Flex)`
  margin: 16px 16px 8px;
  box-sizing: border-box;
`;
const FilterSelectsWrapper = styled(Flex)`
  flex-wrap: wrap;

  & > * {
    margin-bottom: 8px;
  }
  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;
