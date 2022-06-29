import React from 'react';
import styled from 'styled-components';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  AnnotationTableRow,
  ExpandIconComponent,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import { VisionReviewAnnotation } from 'src/modules/Review/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types/annotation';
import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';

export const ReviewVisionAnnotationRow = ({
  additionalData,
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
