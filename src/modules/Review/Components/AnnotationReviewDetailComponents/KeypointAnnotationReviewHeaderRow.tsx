import React from 'react';
import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AnnotationTableRow';

export const KeypointAnnotationReviewCollapseHeader = ({
  annotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
  showColorCircle,
}: AnnotationTableRowProps) => {
  return (
    <AnnotationTableRow
      annotation={annotation}
      onSelect={onSelect}
      onDelete={onDelete}
      onApprove={onApprove}
      onVisibilityChange={onVisibilityChange}
      showColorCircle={showColorCircle}
    />
  );
};
