import React, { useEffect } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Button, Icon, Popconfirm, Title } from '@cognite/cogs.js';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  closeAnnotationDrawer,
  resetEditState,
  resetPreview,
} from 'src/modules/Review/previewSlice';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { selectFileById } from 'src/modules/Common/filesSlice';
import ImageReview from 'src/modules/Review/Containers/ImageReview';
import VideoReview from 'src/modules/Review/Containers/VideoReview';
import { isVideo } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { AnnotationDrawer } from 'src/modules/Review/Components/AnnotationDrawer/AnnotationDrawer';
import { AnnotationDrawerMode } from 'src/utils/AnnotationUtils';
import { ImageReviewDrawerContent } from 'src/modules/Review/Components/AnnotationDrawerContent/ImageReviewAnnotationDrawerContent';
import { ImagePreviewEditMode } from 'src/constants/enums/ImagePreviewEditMode';
import { AddAnnotationsFromEditModeAssetIds } from 'src/store/thunks/AddAnnotationsFromEditModeAssetIds';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import { CreateAnnotations } from 'src/store/thunks/CreateAnnotations';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { getLink, workflowRoutes } from 'src/modules/Workflow/workflowRoutes';
import { PopulateAnnotations } from 'src/store/thunks/PopulateAnnotations';
import { CDFStatus } from 'src/modules/Common/Components/CDFStatus/CDFStatus';
import { fetchFilesById } from 'src/store/thunks/fetchFilesById';

const DeleteButton = (props: { onConfirm: () => void }) => (
  <Popconfirm
    icon="WarningFilled"
    placement="bottom-end"
    onConfirm={props.onConfirm}
    content="Are you sure you want to permanently delete this file?"
  >
    <Button type="ghost-danger" icon="Delete">
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
  const addAnnotationTextNotAvailable = useSelector(
    (state: RootState) =>
      state.previewSlice.drawer.mode === AnnotationDrawerMode.AddAnnotation &&
      !state.previewSlice.drawer.text
  );

  const file = useSelector(({ filesSlice }: RootState) =>
    selectFileById(filesSlice, fileId)
  );

  const showBackButton =
    !!(props.location.state as { from?: string })?.from || false;

  const onBackButtonClick = () => {
    history.goBack();
  };

  const handleFileDelete = () => {
    dispatch(DeleteAnnotationsByFileIds([file!.id]));
    dispatch(deleteFilesById([{ id: file!.id }]));
    onBackButtonClick();
  };

  const handleOnCloseDrawer = () => {
    dispatch(closeAnnotationDrawer());
  };

  const handleOnDrawerCreate = () => {
    if (drawerMode === AnnotationDrawerMode.AddAnnotation) {
      dispatch(CreateAnnotations({ fileId: file!.id, type: drawerMode }));
    } else if (drawerMode === AnnotationDrawerMode.LinkAsset) {
      dispatch(AddAnnotationsFromEditModeAssetIds(file!));
    }
  };

  const handleOnDrawerDelete = () => {
    dispatch(resetEditState());
  };

  useEffect(() => {
    dispatch(resetEditHistory());
    dispatch(resetPreview());
    if (fileId) {
      if (file) {
        dispatch(PopulateAnnotations({ fileId, assetIds: file.assetIds }));
      } else {
        dispatch(fetchFilesById([{ id: +fileId }]));
      }
    }
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <>
      <PageTitle title="Review Annotations" />
      <Container>
        <ToolBar className="z-4">
          <div>
            {showBackButton && (
              <Button
                type="secondary"
                style={{ background: 'white' }}
                shape="round"
                onClick={onBackButtonClick}
              >
                <Icon type="Left" />
                Back
              </Button>
            )}
          </div>
          <Title
            onClick={() => history.push(getLink(workflowRoutes.process))}
            style={{ fontSize: '14px' }}
            level={3}
          >
            {/* Todo: BreadCrumbs */}
            CDF / Contextualize Imagery Data /{' '}
            <strong>Review annotations</strong>
          </Title>
          <CDFStatus />
          <DeleteButton onConfirm={handleFileDelete} />
        </ToolBar>
        {isVideo(file) ? (
          <VideoReview file={file} />
        ) : (
          <ImageReview file={file} drawerMode={drawerMode} />
        )}
        <AnnotationDrawer
          visible={showDrawer}
          title={
            drawerMode !== null && drawerMode === AnnotationDrawerMode.LinkAsset
              ? 'Link to Asset'
              : 'Add annotations'
          }
          disableFooterButtons={
            imagePreviewEditable || addAnnotationTextNotAvailable
          }
          onClose={handleOnCloseDrawer}
          onCreate={handleOnDrawerCreate}
          onDelete={handleOnDrawerDelete}
        >
          {!isVideo(file) && drawerMode !== null && (
            <ImageReviewDrawerContent mode={drawerMode} />
          )}
        </AnnotationDrawer>
      </Container>
    </>
  );
};

export default Review;

const Container = styled.div`
  width: 100%;
  padding: 20px 50px;
  height: 100%;
  display: grid;
  grid-template-rows: 60px calc(100% - 120px);
  position: relative;
  overflow: hidden;
`;

const ToolBar = styled.div`
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  display: grid;
  align-items: center;
  grid-template-columns: min-content auto 200px 130px;
  grid-column-gap: 16px;
`;
