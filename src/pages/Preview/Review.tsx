import React, { useEffect } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Button, Popconfirm, Title } from '@cognite/cogs.js';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  closeAnnotationDrawer,
  createAnnotation,
  resetEditState,
  resetPreview,
} from 'src/store/previewSlice';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { resetEditHistory, selectFileById } from 'src/store/uploadedFilesSlice';
import ImageReview from 'src/pages/Preview/ImageReview';
import VideoReview from 'src/pages/Preview/VideoReview';
import { isVideo } from 'src/components/FileUploader/utils/FileUtils';
import { AnnotationDrawer } from 'src/pages/Preview/components/AnnotationDrawer/AnnotationDrawer';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { ImageReviewDrawerContent } from 'src/pages/Preview/components/AnnotationDrawerContent/ImageReviewAnnotationDrawerContent';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';
import { AddAnnotationsFromEditModeAssetIds } from 'src/store/thunks/AddAnnotationsFromEditModeAssetIds';

const Container = styled.div`
  width: 100%;
  padding: 20px 50px;
  height: 100%;
  display: grid;
  grid-template-rows: 60px 60px calc(100% - 120px);
  position: relative;
  overflow: hidden;
`;
const TitleRow = styled.div`
  padding: 12px;
  width: 100%;
`;

const ToolBar = styled.div`
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 70px auto 130px;
  grid-column-gap: 16px;
`;

const DeleteButton = (props: { onConfirm: () => void }) => (
  <Popconfirm
    icon="WarningFilled"
    placement="bottom-end"
    onConfirm={props.onConfirm}
    content="Are you sure you want to permanently delete this file?"
  >
    <Button type="danger" icon="Delete">
      Delete file
    </Button>
  </Popconfirm>
);

const Review = (props: RouteComponentProps<{ fileId: string }>) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { fileId } = props.match.params;

  const showDrawer = useSelector(
    (state: RootState) => state.previewSlice.drawer.show
  );
  const drawerMode = useSelector(
    (state: RootState) => state.previewSlice.drawer.mode
  );

  const imagePreviewEditable = useSelector(
    (state: RootState) =>
      state.previewSlice.imagePreview.editable ===
      ImagePreviewEditMode.Creatable
  );

  const file = useSelector(({ uploadedFiles }: RootState) =>
    selectFileById(uploadedFiles, fileId)
  );

  if (!file) {
    // navigate to upload step if file is not available(if the user uses a direct link)
    history.push(getLink(workflowRoutes.upload));
    return null;
  }

  const onBackButtonClick = () => {
    history.push(getLink(workflowRoutes.process));
  };

  const handleFileDelete = () => {
    dispatch(deleteFilesById([{ id: file.id }]));
    onBackButtonClick();
  };

  const handleOnCloseDrawer = () => {
    dispatch(closeAnnotationDrawer());
  };

  const handleOnDrawerCreate = () => {
    if (drawerMode === AnnotationDrawerMode.AddAnnotation) {
      dispatch(createAnnotation({ fileId, type: drawerMode }));
    } else if (drawerMode === AnnotationDrawerMode.LinkAsset) {
      dispatch(AddAnnotationsFromEditModeAssetIds(file));
    }
    dispatch(closeAnnotationDrawer());
  };

  const handleOnDrawerDelete = () => {
    dispatch(resetEditState());
  };

  useEffect(() => {
    dispatch(resetEditHistory());
    dispatch(resetPreview());
  }, []);

  return (
    <>
      <PageTitle title="Edit Annotations" />
      <Container>
        <TitleRow>
          <Title level={3}>Edit Annotations and Enrich File</Title>
        </TitleRow>
        <ToolBar className="z-4">
          <Button type="secondary" shape="round" onClick={onBackButtonClick}>
            Back
          </Button>
          <Title level={3}>{file?.name}</Title>
          <DeleteButton onConfirm={handleFileDelete} />
        </ToolBar>
        {isVideo(file) ? (
          <VideoReview fileId={fileId} />
        ) : (
          <ImageReview fileId={fileId} drawerMode={drawerMode} />
        )}
        <AnnotationDrawer
          visible={showDrawer}
          title={
            drawerMode !== null && drawerMode === AnnotationDrawerMode.LinkAsset
              ? 'Link to Asset'
              : 'Add annotations'
          }
          disableFooterButtons={imagePreviewEditable}
          onClose={handleOnCloseDrawer}
          onCreate={handleOnDrawerCreate}
          onDelete={handleOnDrawerDelete}
        >
          {!isVideo(file) && drawerMode !== null && (
            <ImageReviewDrawerContent mode={drawerMode} fileId={fileId} />
          )}
        </AnnotationDrawer>
      </Container>
    </>
  );
};

export default Review;
