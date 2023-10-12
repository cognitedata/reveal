import React from 'react';

import { Tag } from 'antd';

import { ExternalId } from '@cognite/sdk';

import { BulkEditUnsavedState } from '../../../store/common/types';
import { VisionFile } from '../../../store/files/types';
import { BulkEditTableDataType } from '../BulkEditTable/BulkEditTable';
import { CellContainer } from '../utils/CellContainer';

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
