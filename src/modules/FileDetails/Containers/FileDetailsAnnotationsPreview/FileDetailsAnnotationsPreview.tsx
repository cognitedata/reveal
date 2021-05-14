import React, { useMemo } from 'react';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { selectFileAnnotationsByType } from 'src/modules/Common/annotationSlice';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { AnnotationsListPreview } from './AnnotationsListPreview';

export const FileDetailsAnnotationsPreview = ({
  fileId,
  onReviewClick,
}: {
  fileId: number;
  onReviewClick: (id: number) => void;
}) => {
  const textAndObjectAnnotations = useSelector(
    ({ annotationReducer }: RootState) =>
      selectFileAnnotationsByType(annotationReducer, fileId, [
        VisionAPIType.OCR,
        VisionAPIType.ObjectDetection,
      ])
  );

  const tagAnnotations = useSelector(({ annotationReducer }: RootState) =>
    selectFileAnnotationsByType(annotationReducer, fileId, [
      VisionAPIType.TagDetection,
    ])
  );

  const getAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, fileId)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  return (
    <Container>
      <Button // TODO: add disable
        type="tertiary"
        icon="Edit"
        style={{ width: '70%' }}
        disabled={reviewDisabled}
        onClick={() => {
          onReviewClick(+fileId);
        }}
        aria-label="Review annotations"
      >
        Review annotations
      </Button>
      <TitleRow>
        <Title level={5}>Linked assets</Title>
      </TitleRow>
      <AnnotationsListPreview annotations={tagAnnotations} />
      <TitleRow>
        <Title level={5}>Text and objects in image</Title>
      </TitleRow>
      <AnnotationsListPreview annotations={textAndObjectAnnotations} />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
`;

const TitleRow = styled.div`
  padding-top: 18px;
  padding-bottom: 5px;
`;
