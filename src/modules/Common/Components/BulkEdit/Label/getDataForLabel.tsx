import React from 'react';
import { Tag } from 'antd';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import styled from 'styled-components';

export const getDataForLabel = (
  selectedFiles: VisionFile[],
  bulkEditUnsaved: BulkEditUnsavedState
): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, id, labels } = file;
    const newLabels = bulkEditUnsaved.labels;
    return {
      name,
      id,
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
