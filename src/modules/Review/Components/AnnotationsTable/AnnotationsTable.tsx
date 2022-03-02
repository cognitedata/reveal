import { Title } from '@cognite/cogs.js';
import React, { ReactText } from 'react';
import styled from 'styled-components';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { FileInfo } from '@cognite/sdk';
import { AssetLinkWarning } from 'src/modules/Review/Components/AnnotationsTable/AssetLinkWarning';
import { CollapsibleAnnotationTableRow } from 'src/modules/Review/Components/CollapsibleAnnotationTableRow/CollapsibleAnnotationTableRow';
import { AnnotationTableItem } from 'src/modules/Review/types';

export interface AnnotationTableProps {
  title: string;
  file: FileInfo;
  annotations: AnnotationTableItem[];
  mode?: number;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApproveStateChange: (id: ReactText, status: AnnotationStatus) => void;
  onSelect: (id: ReactText, nextState: boolean) => void;
  onKeypointSelect?: (id: string) => void;
  expandAllRowsByDefault?: boolean;
}

export const AnnotationsTable = ({
  title,
  file,
  annotations,
  mode,
  onDelete,
  onVisibilityChange,
  onApproveStateChange,
  onSelect,
  onKeypointSelect,
  expandAllRowsByDefault,
}: AnnotationTableProps) => {
  const annotationsAvailable = annotations.length > 0;

  return (
    <TableContainer>
      <TitleRow>
        <Title level={5}>{title}</Title>
      </TitleRow>
      <Body>
        {annotationsAvailable &&
          annotations.map((annotation) => {
            if (mode === VisionDetectionModelType.TagDetection) {
              return (
                <AssetLinkWarning
                  file={file}
                  annotation={annotation}
                  key={annotation.id}
                  allAnnotations={annotations}
                >
                  <CollapsibleAnnotationTableRow
                    annotation={annotation}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onApprove={onApproveStateChange}
                    onVisibilityChange={onVisibilityChange}
                    onKeyPointSelect={onKeypointSelect}
                    expandByDefault={expandAllRowsByDefault}
                  />
                </AssetLinkWarning>
              );
            }
            return (
              <CollapsibleAnnotationTableRow
                key={annotation.id}
                annotation={annotation}
                onSelect={onSelect}
                onDelete={onDelete}
                onApprove={onApproveStateChange}
                onVisibilityChange={onVisibilityChange}
                onKeyPointSelect={onKeypointSelect}
                expandByDefault={expandAllRowsByDefault}
              />
            );
          })}
        {!annotationsAvailable && (
          <EmptyPlaceHolderContainer>
            <span>
              {mode === VisionDetectionModelType.TagDetection
                ? 'No assets detected or manually added'
                : 'No text or objects detected or manually added'}
            </span>
          </EmptyPlaceHolderContainer>
        )}
      </Body>
    </TableContainer>
  );
};

const EmptyPlaceHolderContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8c8c8c;
`;

const TableContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-rows: 45px auto;
  grid-template-columns: 100%;
  grid-gap: 10px;
  margin-bottom: 20px;
`;

const Body = styled.div`
  width: 100%;
  border: 1px solid #e8e8e8;
  box-sizing: border-box;
  border-radius: 5px;
`;
