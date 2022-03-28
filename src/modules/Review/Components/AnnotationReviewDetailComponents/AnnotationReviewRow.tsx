import React from 'react';
import { KeyboardShortCutSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import { SidePanelRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/SidePanelRow';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AnnotationTableRow';
import {
  ReviewAnnotation,
  RowData,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Components/AnnotationReviewDetailComponents/types';

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
