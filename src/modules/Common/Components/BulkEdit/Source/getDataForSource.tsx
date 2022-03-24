import React from 'react';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import styled from 'styled-components';

export const getOriginalValue = ({
  source,
}: {
  source: string | undefined;
}): JSX.Element => {
  if (source) {
    return <CellContainer>{source}</CellContainer>;
  }
  return <CellContainer>---</CellContainer>;
};

export const getUpdatedValue = ({
  source,
  newSource,
}: {
  source: string | undefined;
  newSource: string | undefined;
}): JSX.Element => {
  if (newSource === '') {
    return <CellContainer>---</CellContainer>;
  }
  if (newSource) {
    return <CellContainer>{newSource}</CellContainer>;
  }
  return source ? (
    <CellContainer>{source}</CellContainer>
  ) : (
    <CellContainer>---</CellContainer>
  );
};

export const getDataForSource = ({
  selectedFiles,
  bulkEditUnsaved,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
}): BulkEditTableDataType[] => {
  const { source: newSource } = bulkEditUnsaved;

  return selectedFiles.map((file) => {
    const { name, source } = file;

    return {
      name,
      original: getOriginalValue({ source }),
      updated: getUpdatedValue({ source, newSource }),
    };
  });
};

export const CellContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
`;
