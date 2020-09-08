/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ProposedCogniteAnnotation,
  ExtractFromCanvasFunction,
} from '@cognite/react-picture-annotation';
import {
  CURRENT_VERSION,
  AnnotationBoundingBox,
  CogniteAnnotation,
} from '@cognite/annotations';
import { PNID_ANNOTATION_TYPE } from 'utils/AnnotationUtils';
import { v4 as uuid } from 'uuid';
import { RootState } from 'reducers';
import { createSelector } from 'reselect';
import { selectObjectJobForFile } from 'modules/fileContextualization/objectDetectionJob';
import { InfoGrid, InfoCell, Divider } from 'components/Common';
import { Title, Body, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

type Props = {
  fileId?: number;
  pendingAnnotations: ProposedCogniteAnnotation[];
  setPendingAnnotations: (annos: ProposedCogniteAnnotation[]) => void;
};

export const ContextualizationModule = ({
  fileId,
  pendingAnnotations,
  setPendingAnnotations,
}: Props) => {
  const [visibleSimilarJobs, setVisibleSimilarJobs] = useState<string[]>([]);
  const [isObjectJobVisible, setObjectJobVisible] = useState<boolean>(false);

  const similarObjectJobs = useSelector((state: RootState) =>
    fileId ? state.fileContextualization.similarObjectJobs[fileId] : {}
  );
  const objectDetectionJobs = useSelector(selectObjectJobForFile)(fileId);

  useEffect(() => {
    const newItems: ProposedCogniteAnnotation[] = [];
    Object.keys(similarObjectJobs || {}).forEach(key => {
      if (
        !visibleSimilarJobs.includes(key) &&
        similarObjectJobs[key].annotations
      ) {
        similarObjectJobs[key].annotations!.forEach(el => {
          newItems.push({
            id: uuid(),
            box: el.boundingBox,
            version: CURRENT_VERSION,
            fileId,
            type: PNID_ANNOTATION_TYPE,
            label: '',
            source: `job:${key}`,
            status: 'unhandled',
            metadata: {
              fromSimilarObject: 'true',
              score: `${el.score}`,
              originalBoxJson: key,
            },
          });
        });
        setVisibleSimilarJobs([...visibleSimilarJobs, key]);
      }
    });
    if (newItems.length > 0) {
      setPendingAnnotations([...pendingAnnotations, ...newItems]);
    }
  }, [
    setPendingAnnotations,
    similarObjectJobs,
    fileId,
    pendingAnnotations,
    visibleSimilarJobs,
  ]);

  useEffect(() => {
    const newItems: ProposedCogniteAnnotation[] = [];
    if (
      !isObjectJobVisible &&
      objectDetectionJobs &&
      objectDetectionJobs.annotations
    ) {
      const types: { [key: string]: string } = {};
      objectDetectionJobs.annotations.forEach(el => {
        if (!types[el.type]) {
          types[el.type] = `#${Math.random().toString(16).substr(-6)}`;
        }
      });
      objectDetectionJobs.annotations!.forEach(el => {
        newItems.push({
          id: uuid(),
          box: el.boundingBox,
          version: CURRENT_VERSION,
          fileId,
          type: PNID_ANNOTATION_TYPE,
          label: '',
          source: `job:${objectDetectionJobs.jobId}`,
          status: 'unhandled',
          metadata: {
            fromObjectDetection: 'true',
            type: `${el.type}`,
            color: types[el.type],
            score: `${el.score}`,
          },
        });
      });
      setObjectJobVisible(true);
    }
    if (newItems.length > 0) {
      setPendingAnnotations([...pendingAnnotations, ...newItems]);
    }
  }, [
    setPendingAnnotations,
    objectDetectionJobs,
    fileId,
    pendingAnnotations,
    isObjectJobVisible,
  ]);

  useEffect(() => {
    setVisibleSimilarJobs([]);
    setObjectJobVisible(false);
  }, [fileId]);

  return null;
};

export const findingObjectStatus = createSelector(
  (state: RootState) => state.fileContextualization.similarObjectJobs,
  similarObjectJobs => (fileId?: number) => {
    if (!fileId) {
      return false;
    }
    const jobs = similarObjectJobs[fileId] || {};

    const isFindingSimilarObjects = jobs
      ? Object.values(jobs).some(el => !el.jobDone)
      : false;

    return isFindingSimilarObjects;
  }
);

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
  background: ${Colors['greyscale-grey3'].hex()};
  width: auto;
  object-fit: contain;
  display: block;
  align-self: flex-start;
  margin-bottom: 16px;
`;
