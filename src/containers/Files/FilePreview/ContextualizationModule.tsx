import React from 'react';
import {
  ProposedCogniteAnnotation,
  ExtractFromCanvasFunction,
} from '@cognite/react-picture-annotation';
import { AnnotationBoundingBox, CogniteAnnotation } from '@cognite/annotations';
import { InfoGrid, InfoCell, Divider } from 'components';
import { Title, Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { lightGrey } from 'utils/Colors';

export const ContextualizationData = ({
  selectedAnnotation,
  extractFromCanvas,
}: {
  selectedAnnotation?: CogniteAnnotation | ProposedCogniteAnnotation;
  extractFromCanvas?: ExtractFromCanvasFunction;
}) => {
  if (selectedAnnotation && 'metadata' in selectedAnnotation) {
    const {
      score,
      fromSimilarObject,
      fromObjectDetection,
      type,
      originalBoxJson,
    } = selectedAnnotation.metadata!;
    let previewSrc: string | undefined;
    if (fromSimilarObject && originalBoxJson) {
      if (extractFromCanvas) {
        const { xMin, yMin, xMax, yMax } = JSON.parse(
          originalBoxJson
        ) as AnnotationBoundingBox;
        if (!!xMin && !!yMin && !!xMax && !!yMax) {
          previewSrc = extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin);
        }
      }
      return (
        <InfoGrid noBorders>
          <InfoCell noBorders>
            <Divider.Horizontal />
            <Title level={5}>From Similar Object</Title>
            <Body level={2}>
              Score: {Math.round((Number(score) + Number.EPSILON) * 100)}%
            </Body>
            {previewSrc && <PreviewImage src={previewSrc} />}
          </InfoCell>
        </InfoGrid>
      );
    }
    if (fromObjectDetection) {
      return (
        <InfoGrid noBorders>
          <InfoCell noBorders>
            <Divider.Horizontal />
            <Title level={5}>From Object Detection</Title>
            <Body level={2}>Type: {type}</Body>
            <Body level={2}>
              Score: {Math.round((Number(score) + Number.EPSILON) * 100)}%
            </Body>
          </InfoCell>
        </InfoGrid>
      );
    }
  }
  return null;
};

const PreviewImage = styled.img`
  max-height: 100px;
  padding: 12px;
  background: ${lightGrey};
  width: auto;
  object-fit: contain;
  display: block;
  align-self: flex-start;
  margin-bottom: 16px;
`;
