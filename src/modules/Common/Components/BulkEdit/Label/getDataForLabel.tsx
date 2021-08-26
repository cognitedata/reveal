import React from 'react';
import { Tag } from 'antd';
import styled from 'styled-components';
import { BulkEditTempState } from 'src/modules/Explorer/store/explorerSlice';
import { FileState } from 'src/modules/Common/filesSlice';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';

export const getDataForLabel = (
  selectedFiles: FileState[],
  bulkEditTemp: BulkEditTempState
): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, labels } = file;
    const newLabels = bulkEditTemp.labels;
    return {
      name,
      original: labels ? (
        <CellContainer>
          {labels.map((label) =>
            newLabels?.some(
              (newLabel) => newLabel.externalId === label.externalId
            ) ? (
              <Tag key={label.externalId} color="green">
                {label.externalId}
              </Tag>
            ) : (
              <Tag key={label.externalId}>{label.externalId}</Tag>
            )
          )}
        </CellContainer>
      ) : (
        <></>
      ),
      updated: newLabels ? (
        <CellContainer>
          {newLabels.map((newLabel) =>
            labels?.some(
              (label) => label.externalId === newLabel.externalId
            ) ? (
              <Tag key={newLabel.externalId} color="green">
                {newLabel.externalId}
              </Tag>
            ) : (
              <Tag key={newLabel.externalId} color="blue">
                {newLabel.externalId}
              </Tag>
            )
          )}
        </CellContainer>
      ) : (
        <></>
      ),
    };
  });
};

const CellContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
`;
