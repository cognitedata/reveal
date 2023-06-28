import React from 'react';

import styled from 'styled-components';

import { CDFAnnotationTypeEnum } from '@vision/api/annotation/types';
import { VisionAnnotationDataType } from '@vision/modules/Common/types/annotation';
import {
  AnnotationTableRow,
  ExpandIconComponent,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/components/common';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/types';
import { VisionReviewAnnotation } from '@vision/modules/Review/types';

export const ReviewVisionAnnotationRow = ({
  additionalData,
  showEditOptions,
}: VirtualizedTreeRowProps<
  AnnotationDetailPanelRowDataBase<
    VisionReviewAnnotation<VisionAnnotationDataType>
  >
>) => {
  const {
    callbacks: { onSelect, onVisibilityChange, onApproveStateChange, onDelete },
    ...visionReviewAnnotationRowData
  } = additionalData;

  const renderContent = () => {
    // collapse icon appears for KeypointAnnotations
    if (
      visionReviewAnnotationRowData.annotation.annotationType ===
      CDFAnnotationTypeEnum.ImagesKeypointCollection
    ) {
      return (
        <PanelHeader>
          <ExpandIconComponent
            isActive={visionReviewAnnotationRowData.selected}
          />
          <AnnotationTableRow
            reviewAnnotation={visionReviewAnnotationRowData}
            onSelect={onSelect}
            onDelete={onDelete}
            onApprove={onApproveStateChange}
            onVisibilityChange={onVisibilityChange}
            showColorCircle={false}
            showEditOptions={showEditOptions}
          />
        </PanelHeader>
      );
    }
    return (
      <AnnotationTableRow
        reviewAnnotation={visionReviewAnnotationRowData}
        onSelect={onSelect}
        onDelete={onDelete}
        onApprove={onApproveStateChange}
        onVisibilityChange={onVisibilityChange}
        showColorCircle
        showEditOptions={showEditOptions}
      />
    );
  };

  return (
    <KeyboardShortCutSelectable
      id={visionReviewAnnotationRowData.annotation.id}
      selected={visionReviewAnnotationRowData.selected}
    >
      <SidePanelRow>{renderContent()}</SidePanelRow>
    </KeyboardShortCutSelectable>
  );
};

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;
