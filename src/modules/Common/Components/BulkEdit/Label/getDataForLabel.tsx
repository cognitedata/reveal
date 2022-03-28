import React from 'react';
import { ExternalId } from '@cognite/sdk';
import { Tag } from 'antd';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import { BulkEditUnsavedState } from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';
import styled from 'styled-components';

export const getTagForOriginal = ({
  item,
  unsavedItems,
}: {
  item: ExternalId;
  unsavedItems: ExternalId[] | undefined;
}): JSX.Element => {
  const newItem = item.externalId;
  if (
    unsavedItems &&
    unsavedItems.some((unsavedItem) => unsavedItem.externalId === newItem)
  ) {
    return (
      <Tag key={newItem} color="blue">
        {newItem}
      </Tag>
    );
  }
  return <Tag key={newItem}>{newItem}</Tag>;
};

export const getNewItems = ({
  unsavedItems,
  existingItems,
}: {
  unsavedItems: ExternalId[];
  existingItems: ExternalId[] | undefined;
}): ExternalId[] => {
  if (existingItems) {
    return unsavedItems.filter(
      (unsavedItem) =>
        !existingItems.some(
          (existingItem) => existingItem.externalId === unsavedItem.externalId
        )
    );
  }
  return unsavedItems;
};

export const getDataForLabel = ({
  selectedFiles,
  bulkEditUnsaved,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
}): BulkEditTableDataType[] => {
  return selectedFiles.map((file) => {
    const { name, id, labels: existingLabels } = file;
    const { labels: unsavedLabels } = bulkEditUnsaved;
    return {
      name,
      id,
      original: existingLabels ? (
        <CellContainer>
          {existingLabels.map((existingLabel) =>
            getTagForOriginal({
              item: existingLabel,
              unsavedItems: unsavedLabels,
            })
          )}
        </CellContainer>
      ) : (
        <></>
      ),
      updated: unsavedLabels ? (
        <CellContainer>
          {getNewItems({
            unsavedItems: unsavedLabels,
            existingItems: existingLabels,
          }).map((newLabel) => (
            <Tag key={newLabel.externalId} color="green">
              {newLabel.externalId}
            </Tag>
          ))}
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
