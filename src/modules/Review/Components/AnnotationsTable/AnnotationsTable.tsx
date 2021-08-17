import { Title } from '@cognite/cogs.js';
import React, { ReactText, useMemo } from 'react';
import styled from 'styled-components';
import { VisibleAnnotation } from 'src/modules/Review/previewSlice';
import { AnnotationStatus, KeypointVertex } from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { AssetLinkWarning } from 'src/modules/Review/Components/AnnotationsTable/AssetLinkWarning';
import { CollapsibleAnnotationTableRow } from 'src/modules/Review/Components/CollapsibleAnnotationTableRow/CollapsibleAnnotationTableRow';

type AnnotationTableItem = Omit<VisibleAnnotation, 'id'> & { id: ReactText };
export interface AnnotationTableProps {
  title: string;
  file: FileInfo;
  selectedAnnotationIds: ReactText[];
  annotations: AnnotationTableItem[];
  mode?: number;
  onDelete: (id: ReactText) => void;
  onVisibilityChange: (id: ReactText) => void;
  onApproveStateChange: (
    annotation: AnnotationTableItem,
    status: AnnotationStatus
  ) => void;
  onSelect: (id: ReactText) => void;
  selectedKeypointIds: ReactText[];
  onKeypointSelect?: (id: string) => void;
}

export const AnnotationsTable = ({
  title,
  file,
  annotations,
  selectedAnnotationIds,
  mode,
  onDelete,
  onVisibilityChange,
  onApproveStateChange,
  onSelect,
  onKeypointSelect,
  selectedKeypointIds,
}: AnnotationTableProps) => {
  const allAnnotations: AnnotationTableItem[] = useMemo(() => {
    return annotations.map((ann) => {
      let value: AnnotationTableItem = { ...ann, selected: false };
      if (selectedAnnotationIds.includes(ann.id)) {
        value = { ...ann, selected: true };
      }

      if (value.data?.keypoint) {
        const keypoints = value.region?.vertices.map((keypointVertex) => ({
          ...(keypointVertex as KeypointVertex),
          selected: selectedKeypointIds.includes(
            (keypointVertex as KeypointVertex).id
          ),
        }));
        value = {
          ...value,
          region: {
            vertices: keypoints as KeypointVertex[],
            shape: value.region!.shape,
          },
        };
      }
      return value;
    });
  }, [annotations, selectedAnnotationIds, selectedKeypointIds]);

  const annotationsAvailable = annotations.length > 0;

  return (
    <TableContainer>
      <TitleRow>
        <Title level={5}>{title}</Title>
      </TitleRow>
      <Body>
        {annotationsAvailable &&
          allAnnotations.map((annotation) => {
            if (mode === VisionAPIType.TagDetection) {
              return (
                <AssetLinkWarning
                  file={file}
                  annotation={annotation}
                  key={annotation.id}
                >
                  <CollapsibleAnnotationTableRow
                    annotation={annotation}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onApprove={onApproveStateChange}
                    onVisibilityChange={onVisibilityChange}
                    onKeyPointSelect={onKeypointSelect}
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
              />
            );
          })}
        {!annotationsAvailable && (
          <EmptyPlaceHolderContainer>
            <span>
              {mode === VisionAPIType.TagDetection
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
