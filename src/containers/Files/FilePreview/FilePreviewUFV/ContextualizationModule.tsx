import React from 'react';
import { ExtractFromCanvasFunction } from '@cognite/react-picture-annotation';
import { AnnotationBoundingBox } from '@cognite/annotations';
import { InfoGrid, InfoCell, Divider } from 'components';
import { Title, Body } from '@cognite/cogs.js';
import styled from 'styled-components';
import { decimalToPercent, lightGrey } from 'utils';
import { isExtendedEventAnnotation } from './migration/utils';
import { ExtendedAnnotation } from './types';

export const ContextualizationData = ({
  selectedAnnotation,
  extractFromCanvas,
}: {
  selectedAnnotation?: ExtendedAnnotation;
  extractFromCanvas?: ExtractFromCanvasFunction;
}) => {
  if (selectedAnnotation === undefined) {
    return null;
  }

  if (!isExtendedEventAnnotation(selectedAnnotation)) {
    return null;
  }

  const eventAnnotationMetadata = selectedAnnotation.metadata.metadata;
  if (eventAnnotationMetadata === undefined) {
    return null;
  }

  const getPreviewSrc = (boxJson: string) => {
    if (!extractFromCanvas) {
      return undefined;
    }
    const { xMin, yMin, xMax, yMax } = JSON.parse(
      boxJson
    ) as AnnotationBoundingBox;
    return Boolean(xMin) && Boolean(yMin) && Boolean(xMax) && Boolean(yMax)
      ? extractFromCanvas(xMin, yMin, xMax - xMin, yMax - yMin)
      : undefined;
  };

  const {
    score,
    fromSimilarObject,
    fromObjectDetection,
    type,
    originalBoxJson,
  } = eventAnnotationMetadata;
  if (fromSimilarObject && originalBoxJson) {
    const previewSrc = getPreviewSrc(originalBoxJson);
    return (
      <InfoGrid noBorders>
        <InfoCell noBorders>
          <Divider.Horizontal />
          <Title level={5}>From Similar Object</Title>
          <Body level={2}>Score: {decimalToPercent(Number(score))}%</Body>
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
          <Body level={2}>Score: {decimalToPercent(Number(score))}%</Body>
        </InfoCell>
      </InfoGrid>
    );
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
