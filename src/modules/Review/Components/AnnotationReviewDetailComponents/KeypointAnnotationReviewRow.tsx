import React from 'react';
import styled from 'styled-components';
import { KeyboardShortCutSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AnnotationTableRow';
import { ExpandIconComponent } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/ExpandIconComponent';
import { SidePanelRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/SidePanelRow';
import { ReviewAnnotation, RowData, VirtualizedTreeRowProps } from './types';

/**
 * Special Annotation Detail row component for Keypoint annotations
 * @param additionalData
 * @constructor
 */
export const KeypointAnnotationReviewRow = ({
  additionalData,
}: VirtualizedTreeRowProps<RowData<ReviewAnnotation>>) => {
  const {
    callbacks: { onSelect, onVisibilityChange, onApproveStateChange, onDelete },
    ...keypointAnnotation
  } = additionalData;

  const renderContent = () => {
    // collapse icon appears for KeypointAnnotations
    if (
      keypointAnnotation.region?.shape === 'points' &&
      keypointAnnotation.region.vertices.length
    ) {
      return (
        <PanelHeader>
          <ExpandIconComponent isActive={keypointAnnotation.selected} />
          <AnnotationTableRow
            annotation={keypointAnnotation}
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
        annotation={keypointAnnotation}
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
      id={keypointAnnotation.id}
      selected={keypointAnnotation.selected}
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
