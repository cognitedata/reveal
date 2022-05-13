import React, { useMemo } from 'react';
import { Button, Title } from '@cognite/cogs.js';
import { makeSelectFileAnnotationsByType } from 'src/modules/Common/store/annotation/selectors';
import { VisionFileDetails } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { AnnotationsListPreview } from 'src/modules/FileDetails/Containers/FileDetailsAnnotationsPreview/AnnotationsListPreview';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { isProcessingFile } from 'src/modules/Process/store/utils';
import { makeSelectJobStatusForFile } from 'src/modules/Process/store/selectors';
import { Thumbnail } from 'src/modules/Common/Components/Thumbnail/Thumbnail';
import { CDFAnnotationTypeEnum } from 'src/api/annotation/types';

export const FileDetailsAnnotationsPreview = ({
  fileInfo,
  onReviewClick,
  onAnnotationDeleteClick,
}: {
  fileInfo: VisionFileDetails;
  onReviewClick: (id: number) => void;
  onAnnotationDeleteClick: (annotationId: number) => void;
}) => {
  // need to create two instances of selector from selector factory since we are using them with different parameters
  const selectFileAnnotationsByOcrObjectTypes = useMemo(
    makeSelectFileAnnotationsByType,
    []
  );
  const selectFileAnnotationsByTagDetectionType = useMemo(
    makeSelectFileAnnotationsByType,
    []
  );

  const textAndObjectAnnotations = useSelector(
    ({ annotationReducer }: RootState) =>
      selectFileAnnotationsByOcrObjectTypes(annotationReducer, fileInfo.id, [
        CDFAnnotationTypeEnum.ImagesTextRegion,
        CDFAnnotationTypeEnum.ImagesObjectDetection,
        CDFAnnotationTypeEnum.ImagesKeypointCollection,
      ])
  );

  const tagAnnotations = useSelector(({ annotationReducer }: RootState) =>
    selectFileAnnotationsByTagDetectionType(annotationReducer, fileInfo.id, [
      CDFAnnotationTypeEnum.ImagesAssetLink,
    ])
  );

  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
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
