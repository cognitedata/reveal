import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionAsset } from 'src/modules/Common/store/files/types';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'src/store';
import { FileInfo } from '@cognite/sdk';
import { unwrapResult } from '@reduxjs/toolkit';

export enum AssetWarnTypes {
  NoWarning,
  ApprovedAnnotationAssetNotLinkedToFile,
  RejectedAnnotationAssetLinkedToFile,
}

const ANNOTATION_STATUS_ERROR_VISIBILITY_DELAY = 2000;

const useAssetLinkWarning = (
  annotation: AnnotationTableItem,
  file: FileInfo,
  allAnnotations: AnnotationTableItem[]
): AssetWarnTypes => {
  const [assetWarnType, setAssetWarnType] = useState<AssetWarnTypes>(
    AssetWarnTypes.NoWarning
  );
  const [asset, setAsset] = useState<VisionAsset | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const approvedAnnotationNotLinkedToFileTimer = useRef<any>(null);
  const rejectedAnnotationLinkedToFileTimer = useRef<any>(null);

  useEffect(() => {
    const fetchAndSetAsset = async (ann: AnnotationTableItem) => {
      const assetPayload = [];
      if (ann.linkedResourceId) {
        assetPayload.push({ id: ann.linkedResourceId });
      } else if (ann.linkedResourceExternalId) {
        assetPayload.push({
          externalId: ann.linkedResourceExternalId,
        });
      }
      try {
        const assetResponse = await dispatch(fetchAssets(assetPayload));
        const assets = unwrapResult(assetResponse);
        if (assets && assets.length) {
          setAsset(assets[0]);
        }
      } catch (e) {
        console.error('Error occurred while fetching asset!', e);
      }
    };

    if (annotation.linkedResourceId || annotation.linkedResourceExternalId) {
      fetchAndSetAsset(annotation);
    } else {
      setAsset(null);
    }
  }, [annotation.linkedResourceId, annotation.linkedResourceExternalId]);

  useEffect(() => {
    // clear timers and cancel pending errors, since not doing it can make app to show error erroneously
    if (approvedAnnotationNotLinkedToFileTimer.current) {
      clearTimeout(approvedAnnotationNotLinkedToFileTimer.current);
      approvedAnnotationNotLinkedToFileTimer.current = null;
    }
    if (rejectedAnnotationLinkedToFileTimer.current) {
      clearTimeout(rejectedAnnotationLinkedToFileTimer.current);
      rejectedAnnotationLinkedToFileTimer.current = null;
    }

    if (asset) {
      if (
        annotation.status === AnnotationStatus.Verified &&
        !file.assetIds?.includes(asset.id)
      ) {
        approvedAnnotationNotLinkedToFileTimer.current = setTimeout(() => {
          // timers delay showing error so other processes can be completed before showing error (file update)
          setAssetWarnType(
            AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile
          );
        }, ANNOTATION_STATUS_ERROR_VISIBILITY_DELAY);
      } else if (
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
        rejectedAnnotationLinkedToFileTimer.current = setTimeout(() => {
          // timers delay showing error so other processes can be completed before showing error (file update)
          setAssetWarnType(AssetWarnTypes.RejectedAnnotationAssetLinkedToFile);
        }, ANNOTATION_STATUS_ERROR_VISIBILITY_DELAY);
      } else {
        setAssetWarnType(AssetWarnTypes.NoWarning);
      }
    } else {
      setAssetWarnType(AssetWarnTypes.NoWarning);
    }
  }, [annotation, file, asset]);

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
