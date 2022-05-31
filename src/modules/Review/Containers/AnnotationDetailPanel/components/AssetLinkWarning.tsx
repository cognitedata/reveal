import React, { ReactElement, useEffect } from 'react';
import { FileInfo } from '@cognite/sdk';
import { Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import useAssetLinkWarning, {
  AssetWarnTypes,
} from 'src/store/hooks/useAssetLinkWarning';
import { VisionAnnotationDataType } from 'src/modules/Common/types/annotation';
import {
  AnnotationTableRowProps,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';

export const AssetWarnMessages = {
  [AssetWarnTypes.NoWarning]: '',
  [AssetWarnTypes.ApprovedAnnotationAssetNotLinkedToFile]:
    'Asset tag verified but file is not linked to the asset. Select true again to restore link.',
  [AssetWarnTypes.RejectedAnnotationAssetLinkedToFile]:
    'Asset tag rejected but file is still linked to the asset. Select false again to remove link.',
};

export const AssetLinkWarning = ({
  file,
  reviewAnnotation,
  allReviewAnnotations,
  onWarningStatusChange,
  children,
}: {
  file: FileInfo;
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>;
  allReviewAnnotations: VisionReviewAnnotation<VisionAnnotationDataType>[];
  onWarningStatusChange?: (visible: boolean) => void;
  children: ReactElement<AnnotationTableRowProps>;
}) => {
  const warningStatus = useAssetLinkWarning(
    reviewAnnotation,
    file,
    allReviewAnnotations
  );

  useEffect(() => {
    // pass warning status to parent
    if (onWarningStatusChange) {
      if (warningStatus !== AssetWarnTypes.NoWarning) {
        onWarningStatusChange(true);
      } else {
        onWarningStatusChange(false);
      }
    }
  }, [warningStatus]);

  const childrenWithProps = React.Children.map(children, (child) => {
    if (
      React.isValidElement(child) &&
      warningStatus !== AssetWarnTypes.NoWarning
    ) {
      return (
        <WarningContainer>
          <IconContainer>
            <Tooltip
              placement="top"
              content={<span>{AssetWarnMessages[warningStatus]}</span>}
            >
              <Icon type="WarningStroke" />
            </Tooltip>
          </IconContainer>
          {children}
        </WarningContainer>
      );
    }
    return child;
  });

  return <> {childrenWithProps} </>;
};

const WarningContainer = styled.div`
  display: flex;
  border: 2px solid red;
  border-radius: 4px;
  position: relative;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  justify-content: center;
  color: red;
  background-color: inherit;
  margin-left: 5px;
  position: absolute;

  & > span:first-child {
    /* adjust icon height */
    height: 16px;
    width: 16px;
  }
`;
