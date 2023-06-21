import React, { useState } from 'react';

import styled from 'styled-components';

import { VisionAnnotationDataType } from '@vision/modules/Common/types/annotation';
import {
  AnnotationTableRow,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/components/common';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/types';
import { VisionReviewAnnotation } from '@vision/modules/Review/types';

import { AssetLinkWarning } from './AssetLinkWarning';

/**
 * Annotation detail row component for Tag annotations
 * @param additionalData
 * @constructor
 */
export const ReviewAssetLinkAnnotationRow = ({
  additionalData,
  showEditOptions,
}: VirtualizedTreeRowProps<
  AnnotationDetailPanelRowDataBase<
    VisionReviewAnnotation<VisionAnnotationDataType>
  >
>) => {
  const {
    common: { reviewAnnotations, file },
    callbacks: { onSelect, onVisibilityChange, onApproveStateChange, onDelete },
    ...visionReviewAnnotationRowData
  } = additionalData;

  const [warningShown, setWarningShown] = useState(false);

  return (
    <KeyboardShortCutSelectable
      id={visionReviewAnnotationRowData.annotation.id}
      selected={visionReviewAnnotationRowData.selected}
      onClick={() =>
        onSelect(
          visionReviewAnnotationRowData.annotation.id,
          !visionReviewAnnotationRowData.selected
        )
      }
    >
      <AssetLinkWarning
        file={file}
        reviewAnnotation={visionReviewAnnotationRowData}
        key={visionReviewAnnotationRowData.annotation.id}
        allReviewAnnotations={reviewAnnotations}
        onWarningStatusChange={setWarningShown}
      >
        <AssetLinkSidePanelRow showWarning={warningShown}>
          <AnnotationTableRow
            reviewAnnotation={visionReviewAnnotationRowData}
            onSelect={onSelect}
            onDelete={onDelete}
            onApprove={onApproveStateChange}
            onVisibilityChange={onVisibilityChange}
            showColorCircle
            showEditOptions={showEditOptions}
          />
        </AssetLinkSidePanelRow>
      </AssetLinkWarning>
    </KeyboardShortCutSelectable>
  );
};

type WarningShawn = { showWarning: boolean };
const AssetLinkSidePanelRow = styled(SidePanelRow)<WarningShawn>`
  height: ${(props) => (props.showWarning ? '36px' : '40px')};
`;
