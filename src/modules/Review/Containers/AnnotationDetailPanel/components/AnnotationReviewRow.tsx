import React from 'react';
import {
  AnnotationTableRow,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import {
  ReviewAnnotation,
  RowData,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';

/**
 * Annotation detail row component for a OCR/OBJECT annotations without child items
 * @param additionalData
 * @constructor
 */
export const AnnotationReviewRow = ({
  additionalData,
}: VirtualizedTreeRowProps<RowData<ReviewAnnotation>>) => {
  const {
    callbacks: { onSelect, onVisibilityChange, onApproveStateChange, onDelete },
    ...annotation
  } = additionalData;

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
