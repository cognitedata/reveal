import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { AnnotationReviewProps } from 'src/modules/Review/Containers/VirtualizedAnnotationsReview';
import { KeyboardShortCutSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import { AssetLinkWarning } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AssetLinkWarning';
import { SidePanelRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/SidePanelRow';
import { AnnotationTableRow } from 'src/modules/Review/Components/AnnotationReviewDetailComponents/Common/AnnotationTableRow';

export const TagAnnotationReviewRow = ({
  annotation,
  annotations,
  file,
  onSelect,
  onDelete,
  onApproveStateChange,
  onVisibilityChange,
}: {
  annotations: AnnotationTableItem[];
  file: FileInfo;
} & AnnotationReviewProps) => {
  return (
    <AssetLinkWarning
      file={file}
      annotation={annotation}
      key={annotation.id}
      allAnnotations={annotations}
    >
      <KeyboardShortCutSelectable
        id={annotation.id}
        selected={annotation.selected}
        onClick={() => onSelect(annotation.id, !annotation.selected)}
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
    </AssetLinkWarning>
  );
};
