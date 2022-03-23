import React from 'react';
import { AnnotationReviewProps } from 'src/modules/Review/Containers/VirtualizedAnnotationsReview';
import { KeyboardShortCutSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import { CollapsibleAnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/CollapsibleAnnotationTableRow';

export const KeypointAnnotationReviewRow = ({
  annotation,
  onSelect,
  onDelete,
  onApproveStateChange,
  onVisibilityChange,
  onKeypointSelect,
  expandByDefault,
}: AnnotationReviewProps) => {
  return (
    <KeyboardShortCutSelectable
      id={annotation.id}
      selected={annotation.selected}
    >
      <CollapsibleAnnotationTableRow
        key={annotation.id}
        annotation={annotation}
        onSelect={onSelect}
        onDelete={onDelete}
        onApprove={onApproveStateChange}
        onVisibilityChange={onVisibilityChange}
        onKeyPointSelect={onKeypointSelect}
        expandByDefault={expandByDefault}
        showColorCircle
      />
    </KeyboardShortCutSelectable>
  );
};
