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
import { VisionReviewAnnotation } from 'src/modules/Review/store/review/types';
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
    ...visionReviewImageKeypointRowData
  } = additionalData;

  const renderContent = () => {
    // collapse icon appears for KeypointAnnotations
    if (
      visionReviewImageKeypointRowData.annotation.annotationType ===
      CDFAnnotationTypeEnum.ImagesKeypointCollection
    ) {
      return (
        <PanelHeader>
          <ExpandIconComponent
            isActive={visionReviewImageKeypointRowData.selected}
          />
          <AnnotationTableRow
            annotation={visionReviewImageKeypointRowData}
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
        annotation={visionReviewImageKeypointRowData}
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
      id={visionReviewImageKeypointRowData.annotation.id}
      selected={visionReviewImageKeypointRowData.selected}
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
