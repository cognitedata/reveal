import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { AnnotationReviewProps } from 'src/modules/Review/Containers/VirtualizedAnnotationsReview';
import { KeyboardShortCutSelectable } from 'src/modules/Review/Containers/KeyboardShortKeys/KeyboardShortCutSelectable';
import styled from 'styled-components';
import { Detail } from '@cognite/cogs.js';
import { CopyableText } from 'src/modules/FileDetails/Components/FileMetadata/CopyableText';
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
        {annotation.linkedResourceExternalId && (
          <SidePanelRow>
            <IDContainer>
              <AnnotationLbl>
                <CopyableText
                  copyable
                  text={annotation.linkedResourceExternalId}
                >
                  <Detail style={{ color: 'inherit', width: 190 }}>
                    {`External ID: ${annotation.linkedResourceExternalId}`}
                  </Detail>
                </CopyableText>
              </AnnotationLbl>
            </IDContainer>
          </SidePanelRow>
        )}
        <SidePanelRow>
          <IDContainer>
            <AnnotationLbl>
              <CopyableText copyable text={annotation.linkedResourceId}>
                <Detail style={{ color: 'inherit', width: 190 }}>
                  {`Internal ID: ${annotation.linkedResourceId}`}
                </Detail>
              </CopyableText>
            </AnnotationLbl>
          </IDContainer>
        </SidePanelRow>
      </KeyboardShortCutSelectable>
    </AssetLinkWarning>
  );
};

const IDContainer = styled.div`
  padding-left: 34px;
`;

type AnnotationLabelOpts = {
  color?: string;
};

const AnnotationLbl = styled.div<AnnotationLabelOpts>`
  width: 100%;
  height: 100%;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${(props) => props.color || 'inherit'};
`;
