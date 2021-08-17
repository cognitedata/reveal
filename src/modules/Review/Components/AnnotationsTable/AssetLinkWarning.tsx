import { FileInfo } from '@cognite/cdf-sdk-singleton';
import React, { useEffect, useState } from 'react';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { VisionAsset } from 'src/modules/Common/filesSlice';
import { unwrapResult } from '@reduxjs/toolkit';
import { AnnotationTableItem } from 'src/modules/Review/types';

export const AssetLinkWarning = ({
  file,
  annotation,
  children,
}: {
  file: FileInfo;
  annotation: AnnotationTableItem;
  children: any;
}) => {
  const dispatch = useDispatch();
  const [showWarning, setShowWarning] = useState<boolean>(false);

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
    calculateWarningStatus(dispatch, annotation, fileAssetIds, setWarning);
    return () => {
      console.log('removed');
    };
  }, [annotation, file]);

  if (showWarning) {
    return (
      <Container>
        <IconContainer>
          <Tooltip
            placement="top"
            content="Verified asset tag, but file is not linked to the asset. Verify again to restore link"
          >
            <Icon type="WarningStroke" color="red" />
          </Tooltip>
        </IconContainer>
        {children}
      </Container>
    );
  }

  return <> {children} </>;
};

const calculateWarningStatus = async (
  dispatch: any,
  annotation: AnnotationTableItem,
  fileAssetIds: number[],
  setWarning: (status: boolean) => void
) => {
  if (annotation.linkedResourceId || annotation.linkedResourceExternalId) {
    let assetId = null;
    if (annotation.linkedResourceId) {
      assetId = annotation.linkedResourceId;
    } else if (annotation.linkedResourceExternalId) {
      const assetResponseUnwrapped = await dispatch(
        fetchAssets([{ externalId: annotation.linkedResourceExternalId }])
      );
      const assetResponse = unwrapResult(assetResponseUnwrapped);
      const asset: VisionAsset = assetResponse.length && assetResponse[0];
      if (asset) {
        assetId = asset.id;
      }
    }

    if (
      assetId &&
      annotation.status === AnnotationStatus.Verified &&
      !fileAssetIds.includes(assetId)
    ) {
      setWarning(true);
    } else {
      setWarning(false);
    }
  } else {
    setWarning(false);
  }
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr;
  border: 1px solid red;
  border-radius: 5px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
