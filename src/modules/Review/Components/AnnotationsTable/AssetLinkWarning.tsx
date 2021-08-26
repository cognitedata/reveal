import { FileInfo } from '@cognite/cdf-sdk-singleton';
import React, { ReactElement, useEffect, useState } from 'react';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { VisionAsset } from 'src/modules/Common/filesSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import {
  AnnotationTableItem,
  AnnotationTableRowProps,
} from 'src/modules/Review/types';

export enum AssetWarnTypes {
  NoWarning,
  ApprovedAnnotationAssetNotLinkedToFile,
  RejectedAnnotationAssetLinkedToFile,
}

export const AssetWarnMessages = {
  [AssetWarnTypes.NoWarning]: '',
  [AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile]:
    'Asset tag verified but file is not linked to the asset. Select true again to restore link.',
  [AssetWarnTypes.RejectedAnnotationAssetLinkedToFile]:
    'Asset tag rejected but file is still linked to the asset. Select false again to remove link.',
};

export const AssetLinkWarning = ({
  file,
  annotation,
  allAnnotations,
  children,
}: {
  file: FileInfo;
  annotation: AnnotationTableItem;
  allAnnotations: AnnotationTableItem[];
  children: ReactElement<AnnotationTableRowProps>;
}) => {
  const dispatch = useDispatch();
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [warningType, setWarningType] = useState<AssetWarnTypes>(
    AssetWarnTypes.NoWarning
  );

  useEffect(() => {
    const fileAssetIds = file.assetIds || [];
    const setWarning = (status: boolean) => {
      if (status && !showWarning) {
        setShowWarning(true);
      }
      if (!status && showWarning) {
        setShowWarning(false);
      }
    };
    calculateWarningStatus(
      dispatch,
      annotation,
      fileAssetIds,
      allAnnotations,
      setWarning,
      setWarningType
    );
    return () => {
      console.log('removed');
    };
  }, [annotation, file]);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && showWarning) {
      return (
        <>
          {React.Children.only(
            React.cloneElement(children, {
              iconComponent: (
                <IconContainer>
                  <Tooltip
                    placement="top"
                    content={<span>{AssetWarnMessages[warningType]}</span>}
                  >
                    <Icon type="WarningStroke" />
                  </Tooltip>
                </IconContainer>
              ),
              borderColor: 'red',
            })
          )}
        </>
      );
    }
    return child;
  });

  return <> {childrenWithProps} </>;
};

const calculateWarningStatus = async (
  dispatch: any,
  annotation: AnnotationTableItem,
  fileAssetIds: number[],
  allAnnotations: AnnotationTableItem[],
  setWarning: (status: boolean) => void,
  setWarningType: (type: AssetWarnTypes) => void
) => {
  if (annotation.linkedResourceId || annotation.linkedResourceExternalId) {
    const assetPayload = [];
    if (annotation.linkedResourceId) {
      assetPayload.push({ id: annotation.linkedResourceId });
    } else if (annotation.linkedResourceExternalId) {
      assetPayload.push({ externalId: annotation.linkedResourceExternalId });
    }
    const assetResponseUnwrapped = await dispatch(fetchAssets(assetPayload));
    const assetResponse = unwrapResult(assetResponseUnwrapped);
    const asset: VisionAsset = assetResponse.length && assetResponse[0];

    if (asset) {
      if (
        annotation.status === AnnotationStatus.Verified &&
        !fileAssetIds.includes(asset.id)
      ) {
        setWarning(true);
        setWarningType(AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile);
        return;
      }
      if (
        annotation.status === AnnotationStatus.Rejected &&
        fileAssetIds.includes(asset.id) &&
        allAnnotations
          .filter(
            (ann) =>
              ann.id !== annotation.id &&
              ann.status === AnnotationStatus.Verified
          ) // select other annotations except this one
          .every((tagAnnotation) => !isLinkedToAsset(tagAnnotation, asset)) // every other tag annotation is not approved and linked to the same asset
      ) {
        setWarning(true);
        setWarningType(AssetWarnTypes.RejectedAnnotationAssetLinkedToFile);
        return;
      }
    }
  }
  setWarningType(AssetWarnTypes.NoWarning);
  setWarning(false);
};

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

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: red;
  background-color: inherit;
`;
