import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';

import { RootState } from '../../../../store/rootReducer';
import { Thumbnail } from '../../../Common/Components/Thumbnail/Thumbnail';
import { makeSelectJobStatusForFile } from '../../../Process/store/selectors';
import { isProcessingFile } from '../../../Process/store/utils';
import { AnnotationDetailPanel } from '../../../Review/Containers/AnnotationDetailPanel/AnnotationDetailPanel';
import { VisionFileDetails } from '../../Components/FileMetadata/Types';

export const FileDetailsAnnotationsPreview = ({
  fileInfo,
  onReviewClick,
}: {
  fileInfo: VisionFileDetails;
  onReviewClick: (id: number) => void;
}) => {
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
      <ThumbnailContainer className="image">
        <Thumbnail
          fileInfo={fileInfo} // TODO: only show in table view
        />
      </ThumbnailContainer>
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
      <AnnotationDetailPanel file={fileInfo} showEditOptions={false} />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 200px 50px auto;
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

const ThumbnailContainer = styled.div`
  padding-top: 18px;
  padding-bottom: 5px;
  height: 200px;
`;