import React, { useEffect } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Button, Icon, Popconfirm, ToastContainer } from '@cognite/cogs.js';
import { Prompt, RouteComponentProps, useHistory } from 'react-router-dom';
import { batch, useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  resetPreview,
  showCollectionSettingsModel,
} from 'src/modules/Review/previewSlice';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { selectFileById } from 'src/modules/Common/filesSlice';
import ImageReview from 'src/modules/Review/Containers/ImageReview';
import VideoReview from 'src/modules/Review/Containers/VideoReview';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { CollectionSettingsModal } from 'src/modules/Common/Components/CollectionSettingsModal/CollectionSettingsModal';
import { PopulateAnnotationTemplates } from 'src/store/thunks/PopulateAnnotationTemplates';
import { FetchFilesById } from 'src/store/thunks/FetchFilesById';
import { pushMetric } from 'src/utils/pushMetric';
import { PopulateReviewFiles } from 'src/store/thunks/PopulateReviewFiles';

pushMetric('Vision.Review');

const DeleteButton = (props: { onConfirm: () => void }) => (
  <div style={{ minWidth: '120px' }}>
    <Popconfirm
      icon="WarningFilled"
      placement="bottom-end"
      onConfirm={props.onConfirm}
      content="Are you sure you want to permanently delete this file?"
    >
      <Button type="ghost-danger" icon="Trash">
        Delete file
      </Button>
    </Popconfirm>
  </div>
);

const Review = (props: RouteComponentProps<{ fileId: string }>) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { fileId } = props.match.params;

  const showCollectionSettingsModal = useSelector(
    ({ previewSlice }: RootState) => previewSlice.showCollectionSettings
  );

  const file = useSelector(({ filesSlice }: RootState) =>
    selectFileById(filesSlice, +fileId)
  );

  const reviewFileIds = useSelector(
    ({ previewSlice }: RootState) => previewSlice.fileIds
  );

  const previousPage = (props.location.state as { from?: string })?.from;
  const showBackButton = !!previousPage || false;

  const onBackButtonClick = () => {
    history.goBack();
  };

  const handleFileDelete = () => {
    batch(() => {
      dispatch(DeleteAnnotationsByFileIds([file!.id]));
      dispatch(deleteFilesById([{ id: file!.id }]));
    });
    onBackButtonClick();
  };

  useEffect(() => {
    dispatch(resetEditHistory());
    dispatch(resetPreview());
    if (
      fileId &&
      !file &&
      (!reviewFileIds || (reviewFileIds && !reviewFileIds.length))
    ) {
      batch(() => {
        dispatch(PopulateReviewFiles([+fileId]));
        dispatch(FetchFilesById([+fileId]));
      });
    }
    if (file) {
      dispatch(RetrieveAnnotations([+fileId]));
    }
  }, [file, reviewFileIds]);

  useEffect(() => {
    dispatch(FetchFilesById(reviewFileIds));
  }, [reviewFileIds]);

  useEffect(() => {
    dispatch(PopulateAnnotationTemplates());
  }, []);

  if (!file) {
    return null;
  }
  const promptMessage =
    'Are you sure you want to leave or refresh this page? The session state may be lost.';
  const renderView = () => {
    return (
      <>
        <ToastContainer />
        <PageTitle title="Review Annotations" />
        <Container>
          <ToolBar>
            <StatusToolBar
              current="Review"
              previous={previousPage!}
              left={
                showBackButton ? (
                  <Button
                    type="secondary"
                    style={{ background: 'white' }}
                    shape="round"
                    onClick={onBackButtonClick}
                  >
                    <Icon type="Left" />
                    Back
                  </Button>
                ) : (
                  <></>
                )
              }
              right={<DeleteButton onConfirm={handleFileDelete} />}
            />
          </ToolBar>
          {isVideo(file) ? (
            <VideoReview file={file} prev={previousPage} />
          ) : (
            <ImageReview file={file} prev={previousPage} />
          )}
        </Container>
      </>
    );
  };
  return (
    <>
      {previousPage === 'process' && (
        <Prompt
          message={(location, _) => {
            return location.pathname.includes(`vision/workflow/process`) ||
              location.pathname.includes(`vision/workflow/review`)
              ? true
              : promptMessage;
          }}
        />
      )}

      {renderView()}
      <CollectionSettingsModal
        showModal={showCollectionSettingsModal}
        onCancel={() => dispatch(showCollectionSettingsModel(false))}
      />
    </>
  );
};

export default Review;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 50px calc(100% - 50px);
  grid-template-columns: auto;
  overflow: hidden;
`;

const ToolBar = styled.div`
  width: 100%;
  height: 40px;
`;
