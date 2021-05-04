import React from 'react';
import { Button, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { selectAnnotationsByFileIdModelTypes } from 'src/modules/Preview/previewSlice';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { VisionAPIType } from 'src/api/types';
import { AnnotationsListPreview } from './AnnotationsListPreview';

export const FileDetailsAnnotationsPreview = ({
  fileId,
  onReviewClick,
}: {
  fileId: string;
  onReviewClick: (id: number) => void;
}) => {
  const tagAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectAnnotationsByFileIdModelTypes(previewSlice, fileId, [
      VisionAPIType.TagDetection,
    ])
  );

  const gdprAndTextAndObjectAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectAnnotationsByFileIdModelTypes(previewSlice, fileId, [
        VisionAPIType.OCR,
        VisionAPIType.ObjectDetection,
      ])
  );

  return (
    <Container>
      <Button // TODO: add disable
        type="tertiary"
        icon="Edit"
        style={{ width: '70%' }}
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
      <AnnotationsListPreview annotations={gdprAndTextAndObjectAnnotations} />
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
