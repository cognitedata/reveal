import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ReviewAnnotation,
  RowData,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  AnnotationTableRow,
  AssetLinkWarning,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';

/**
 * Annotation detail row component for Tag annotations
 * @param additionalData
 * @constructor
 */
export const TagAnnotationReviewRow = ({
  additionalData,
}: VirtualizedTreeRowProps<RowData<ReviewAnnotation>>) => {
  const {
    common: { annotations, file },
    callbacks: { onSelect, onVisibilityChange, onApproveStateChange, onDelete },
    ...annotation
  } = additionalData;

  const [warningShown, setWarningShown] = useState(false);

  return (
    <KeyboardShortCutSelectable
      id={annotation.id}
      selected={annotation.selected}
      onClick={() => onSelect(annotation.id, !annotation.selected)}
    >
      <AssetLinkWarning
        file={file}
        annotation={annotation}
        key={annotation.id}
        allAnnotations={annotations}
        onWarningStatusChange={setWarningShown}
      >
        <AssetLinkSidePanelRow showWarning={warningShown}>
          <AnnotationTableRow
            annotation={annotation}
            onSelect={onSelect}
            onDelete={onDelete}
            onApprove={onApproveStateChange}
            onVisibilityChange={onVisibilityChange}
            showColorCircle
          />
        </AssetLinkSidePanelRow>
      </AssetLinkWarning>
    </KeyboardShortCutSelectable>
  );
};

type WarningShawn = { showWarning: boolean };
const AssetLinkSidePanelRow = styled(SidePanelRow)<WarningShawn>`
  height: ${(props) => (props.showWarning ? '26px' : '30px')};
`;
