import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { VisionAsset } from 'src/modules/Common/store/files/types';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { unwrapResult } from '@reduxjs/toolkit';

export enum AssetWarnTypes {
  NoWarning,
  ApprovedAnnotationAssetNotLinkedToFile,
  RejectedAnnotationAssetLinkedToFile,
}

const useAssetLinkWarning = (
  annotation: AnnotationTableItem,
  file: FileInfo,
  allAnnotations: AnnotationTableItem[]
): AssetWarnTypes => {
  const [assetWarnType, setAssetWarnType] = useState<AssetWarnTypes>(
    AssetWarnTypes.NoWarning
  );
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    async function calculateWarningType() {
      if (
        file &&
        (annotation.linkedResourceId || annotation.linkedResourceExternalId)
      ) {
        const assetPayload = [];
        if (annotation.linkedResourceId) {
          assetPayload.push({ id: annotation.linkedResourceId });
        } else if (annotation.linkedResourceExternalId) {
          assetPayload.push({
            externalId: annotation.linkedResourceExternalId,
          });
        }
        const assetResponse = await dispatch(fetchAssets(assetPayload));
        const assets = unwrapResult(assetResponse);

        if (assets && assets.length) {
          const asset = assets[0];
          if (
            annotation.status === AnnotationStatus.Verified &&
            !file.assetIds?.includes(asset.id)
          ) {
            setAssetWarnType(
              AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
            );
            return;
          }
          if (
            annotation.status === AnnotationStatus.Rejected &&
            file.assetIds?.includes(asset.id) &&
            allAnnotations
              .filter(
                (ann) =>
                  ann.id !== annotation.id &&
                  ann.status === AnnotationStatus.Verified
              ) // select other annotations except this one
              .every((tagAnnotation) => !isLinkedToAsset(tagAnnotation, asset)) // every other tag annotation is not approved and linked to the same asset
          ) {
            setAssetWarnType(
              AssetWarnTypes.RejectedAnnotationAssetLinkedToFile
            );
            return;
          }
        }
      }
      setAssetWarnType(AssetWarnTypes.NoWarning);
    }
    calculateWarningType();
  }, [annotation, file]);

  return assetWarnType;
};

export default useAssetLinkWarning;

const isLinkedToAsset = (
  ann: AnnotationTableItem,
  asset: VisionAsset
): boolean => {
  if (ann.linkedResourceId) {
    return ann.linkedResourceId === asset.id;
  }
  if (ann.linkedResourceExternalId) {
    return ann.linkedResourceExternalId === asset.externalId;
  }
  return false;
};
