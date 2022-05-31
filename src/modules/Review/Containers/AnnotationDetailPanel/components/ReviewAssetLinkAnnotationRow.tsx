import React, { useState } from 'react';
import styled from 'styled-components';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  AnnotationTableRow,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import { VisionReviewAnnotation } from 'src/modules/Review/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types/annotation';
import { AssetLinkWarning } from './AssetLinkWarning';

/**
 * Annotation detail row component for Tag annotations
 * @param additionalData
 * @constructor
 */
export const ReviewAssetLinkAnnotationRow = ({
  additionalData,
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
          />
        </AssetLinkSidePanelRow>
      </AssetLinkWarning>
    </KeyboardShortCutSelectable>
  );
};

type WarningShawn = { showWarning: boolean };
const AssetLinkSidePanelRow = styled(SidePanelRow)<WarningShawn>`
  height: ${(props) => (props.showWarning ? '26px' : '30px')};
`;
