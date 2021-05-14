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
import { Thumbnail } from 'src/modules/Common/Components/Thumbnail/Thumbnail';
import { AnnotationsListPreview } from './AnnotationsListPreview';
import { VisionFileDetails } from '../../Components/FileMetadata/Types';

export const FileDetailsAnnotationsPreview = ({
  fileInfo,
  onReviewClick,
  onAnnotationDeleteClick,
}: {
  fileInfo: VisionFileDetails;
  onReviewClick: (id: number) => void;
  onAnnotationDeleteClick: (annotationId: number) => void;
}) => {
  const textAndObjectAnnotations = useSelector(
    ({ annotationReducer }: RootState) =>
      selectFileAnnotationsByType(annotationReducer, fileInfo.id, [
        VisionAPIType.OCR,
        VisionAPIType.ObjectDetection,
      ])
  );

  const tagAnnotations = useSelector(({ annotationReducer }: RootState) =>
    selectFileAnnotationsByType(annotationReducer, fileInfo.id, [
      VisionAPIType.TagDetection,
    ])
  );

  const getAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, fileInfo.id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  const handleOnReviewClick = () => {
    onReviewClick(+fileInfo.id);
  };

  return (
    <Container>
      <div className="image">
        <Thumbnail
          fileInfo={fileInfo} // TODO: only show in table view
        />
      </div>
      <Button
        type="tertiary"
        icon="Edit"
        style={{ width: '70%' }}
        disabled={reviewDisabled}
        onClick={handleOnReviewClick}
        aria-label="Review annotations"
      >
        Review annotations
      </Button>
      <TitleRow>
        <Title level={5}>Linked assets</Title>
      </TitleRow>
      <AnnotationsListPreview
        annotations={tagAnnotations}
        reviewDisabled={reviewDisabled}
        handleReview={handleOnReviewClick}
        onAnnotationDeleteClick={onAnnotationDeleteClick}
      />
      <TitleRow>
        <Title level={5}>Text and objects in image</Title>
      </TitleRow>
      <AnnotationsListPreview
        annotations={textAndObjectAnnotations}
        reviewDisabled={reviewDisabled}
        handleReview={handleOnReviewClick}
        onAnnotationDeleteClick={onAnnotationDeleteClick}
      />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: grid;

  .image {
    height: 191px;
    padding-top: 11px;
    padding-bottom: 11px;
    overflow: hidden;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }
`;

const TitleRow = styled.div`
  padding-top: 18px;
  padding-bottom: 5px;
`;
