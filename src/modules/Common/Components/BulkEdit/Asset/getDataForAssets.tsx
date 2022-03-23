import React from 'react';
import styled from 'styled-components';
import { Tag } from 'antd';
import { BulkEditTableDataType } from 'src/modules/Common/Components/BulkEdit/BulkEditTable/BulkEditTable';
import {
  AssetIds,
  BulkEditUnsavedState,
} from 'src/modules/Common/store/common/types';
import { VisionFile } from 'src/modules/Common/store/files/types';

export const getTagForOriginal = ({
  assetId,
  unsavedAssetIds,
  assetsDetails,
}: {
  assetId: number;
  unsavedAssetIds: AssetIds | undefined;
  assetsDetails: Record<number, { name: string }>;
}) => {
  const assetsDetail: { name: string } | undefined = assetsDetails[assetId];
  if (assetsDetail) {
    if (unsavedAssetIds) {
      const { addedAssetIds, removedAssetIds } = unsavedAssetIds;
      if (removedAssetIds && removedAssetIds.includes(assetId)) {
        return (
          <Tag key={assetId} color="red">
            {assetsDetails[assetId].name}
          </Tag>
        );
      }
      if (addedAssetIds && addedAssetIds.includes(assetId)) {
        return (
          <Tag key={assetId} color="blue">
            {assetsDetails[assetId].name}
          </Tag>
        );
      }
    }
    return <Tag key={assetId}>{assetsDetails[assetId].name}</Tag>;
  }
  return <Tag key={assetId} />;
};

export const separateNewAssets = ({
  existingAssetIds,
  unsavedAssetIds,
}: {
  existingAssetIds: number[] | undefined;
  unsavedAssetIds: AssetIds | undefined;
}): {
  newAssetIds: number[];
  originalAssetIds: number[];
} => {
  if (unsavedAssetIds) {
    const { addedAssetIds, removedAssetIds } = unsavedAssetIds;
    if (addedAssetIds && removedAssetIds) {
      const newAssetIds = addedAssetIds.filter(
        (addedAssetId) =>
          !existingAssetIds?.includes(addedAssetId) &&
          !removedAssetIds.includes(addedAssetId)
      );
      const originalAssetIds =
        existingAssetIds?.filter(
          (existingAssetId) => !removedAssetIds.includes(existingAssetId)
        ) || [];
      return { newAssetIds, originalAssetIds };
    }
    if (addedAssetIds) {
      const newAssetIds = addedAssetIds.filter(
        (addedAssetId) => !existingAssetIds?.includes(addedAssetId)
      );
      return { newAssetIds, originalAssetIds: existingAssetIds || [] };
    }
    if (removedAssetIds) {
      const originalAssetIds =
        existingAssetIds?.filter(
          (existingAssetId) => !removedAssetIds.includes(existingAssetId)
        ) || [];
      return { newAssetIds: [], originalAssetIds };
    }
  }
  return { newAssetIds: [], originalAssetIds: existingAssetIds || [] };
};

export const getTagForUpdated = ({
  assetId,
  assetsDetails,
  unsavedAssetIds,
}: {
  assetId: number;
  assetsDetails: Record<number, { name: string }>;
  unsavedAssetIds: AssetIds | undefined;
}) => {
  const assetsDetail: { name: string } | undefined = assetsDetails[assetId];
  if (assetsDetail) {
    if (unsavedAssetIds) {
      const { addedAssetIds, removedAssetIds } = unsavedAssetIds;
      if (removedAssetIds && removedAssetIds.includes(assetId)) {
        // assetId cannot be a removed item a we filter them from separateNewAssets
        return null;
      }
      if (addedAssetIds && addedAssetIds.includes(assetId)) {
        return (
          <Tag key={assetId} color="blue">
            {assetsDetails[assetId].name}
          </Tag>
        );
      }
    }
    return <Tag key={assetId}>{assetsDetails[assetId].name}</Tag>;
  }
  return <Tag key={assetId} />;
};

export const getTagForNew = ({
  assetId,
  assetsDetails,
}: {
  assetId: number;
  assetsDetails: Record<number, { name: string }>;
}) => {
  const name = assetsDetails[assetId]?.name;
  if (name) {
    return (
      <Tag key={assetId} color="green">
        {name}
      </Tag>
    );
  }
  return <Tag key={assetId} color="green" />;
};

export const getDataForAssets = ({
  selectedFiles,
  bulkEditUnsaved,
  assetsDetails,
}: {
  selectedFiles: VisionFile[];
  bulkEditUnsaved: BulkEditUnsavedState;
  assetsDetails: Record<number, { name: string }>;
}): BulkEditTableDataType[] => {
  const { assetIds: unsavedAssetIds } = bulkEditUnsaved;
  return selectedFiles.map((file) => {
    const { name, id, assetIds: existingAssetIds } = file;
    const { newAssetIds, originalAssetIds } = separateNewAssets({
      existingAssetIds,
      unsavedAssetIds,
    });
    return {
      name,
      id,
      original: existingAssetIds ? (
        <CellContainer>
          {existingAssetIds.map((assetId) =>
            getTagForOriginal({ assetId, unsavedAssetIds, assetsDetails })
          )}
        </CellContainer>
      ) : (
        <></>
      ),
      updated: (
        <CellContainer>
          {originalAssetIds &&
            originalAssetIds.map((assetId) =>
              getTagForUpdated({
                assetId,
                unsavedAssetIds,
                assetsDetails,
              })
            )}
          {newAssetIds &&
            newAssetIds.map((assetId) =>
              getTagForNew({ assetId, assetsDetails })
            )}
        </CellContainer>
      ),
    };
  });
};

const CellContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
`;
