import React from 'react';
import { AnnotationReviewProps } from 'src/modules/Review/Containers/VirtualizedAnnotationsReview';
import { KeyboardShortCutSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import { SidePanelRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/SidePanelRow';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AnnotationTableRow';

export const AnnotationReviewRow = ({
  annotation,
  onSelect,
  onDelete,
  onApproveStateChange,
  onVisibilityChange,
}: AnnotationReviewProps) => {
  return (
    <KeyboardShortCutSelectable
      id={annotation.id}
      selected={annotation.selected}
    >
      <SidePanelRow>
        <AnnotationTableRow
          annotation={annotation}
          onSelect={onSelect}
          onDelete={onDelete}
          onApprove={onApproveStateChange}
          onVisibilityChange={onVisibilityChange}
          showColorCircle
        />
      </SidePanelRow>
    </KeyboardShortCutSelectable>
  );
};
