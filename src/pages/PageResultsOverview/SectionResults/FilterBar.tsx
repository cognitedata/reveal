import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { Flex } from 'components/Common';
import {
  DataSetSelect,
  LabelSelect,
  MimeTypeSelect,
  StatusSelect,
  StatusType,
} from 'components/Filters';
import { SelectionFilter } from './types';

type Props = {
  selectionFilter: SelectionFilter;
  setSelectionFilter: (selectionFilter: SelectionFilter) => void;
};
export default function FilterBar(props: Props) {
  const { selectionFilter, setSelectionFilter } = props;
  const [nameQuery, setNameQuery] = useState<string>('');
  const [dataSetIds, setDataSetIds] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusType[]>([]);
  const [fileTypes, setFileTypes] = useState<string[]>(['application/pdf']);

  const onNameChange = useCallback(
    (e: any) => setNameQuery(e.target.value),
    []
  );
  const onDataSetSelected = useCallback(
    (ids: number[]) => setDataSetIds(ids),
    []
  );
  const onMimeTypeSelected = useCallback(
    (mimeTypes: string[]) => setFileTypes(mimeTypes),
    []
  );
  const onLabelsSelected = useCallback(
    (selectedLabels: string[]) => setLabels(selectedLabels),
    []
  );

  useEffect(() => {
    const newFilter = {
      ...selectionFilter,
      nameQuery,
      dataSetIds,
      labels,
      status,
      fileTypes,
    };
    setSelectionFilter(newFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameQuery, dataSetIds, labels, status, fileTypes]);

  return (
    <FilterBarWrapper row>
      <Input
        placeholder="Filter by name"
        style={{ width: '250px' }}
        value={nameQuery}
        onChange={onNameChange}
      />
      <DataSetSelect
        resourceType="files"
        onDataSetSelected={onDataSetSelected}
      />
      <LabelSelect
        selectedLabels={labels}
        onLabelsSelected={onLabelsSelected}
      />
      <MimeTypeSelect
        selectedMimeType={fileTypes}
        onMimeTypeSelected={onMimeTypeSelected}
        loaded
        isMulti
      />
      <StatusSelect statusType={status} setStatusType={setStatus} />
    </FilterBarWrapper>
  );
}

const FilterBarWrapper = styled(Flex)`
  width: 100%;
  margin: 16px;
  flex-wrap: wrap;
  & > * {
    margin-right: 8px;
  }
`;
