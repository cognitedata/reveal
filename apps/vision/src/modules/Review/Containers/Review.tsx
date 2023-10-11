import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { batch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

// import { CustomPrompt } from '@vision/modules/Common/Components/CustomPrompt/CustomPrompt';
import { notification } from 'antd';

import { PageTitle } from '@cognite/cdf-utilities';
import { Button, Icon, Popconfirm, ToastContainer } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { PopulateAnnotationTemplates } from '../../../store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from '../../../store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from '../../../store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from '../../../store/thunks/Files/FetchFilesById';
import { PopulateProcessFiles } from '../../../store/thunks/Process/PopulateProcessFiles';
import { PopulateReviewFiles } from '../../../store/thunks/Review/PopulateReviewFiles';
import { pushMetric } from '../../../utils/pushMetric';
import { getParamLink, workflowRoutes } from '../../../utils/workflowRoutes';
import { selectFileById } from '../../Common/store/files/selectors';
import { resetEditHistory } from '../../FileDetails/slice';
import { StatusToolBar } from '../../Process/Containers/StatusToolBar';
import { resetPreview } from '../store/review/slice';

import ReviewBody from './ReviewBody';

const DeleteButton = (props: {
  onConfirm: () => void;
  isDeleteInProgress: boolean;
}) => (
  <div style={{ minWidth: '120px' }}>
    <Popconfirm
      icon="WarningFilled"
      placement="bottom-end"
      onConfirm={props.onConfirm}
      content="Are you sure you want to permanently delete this file?"
    >
      <Button
        type="ghost-destructive"
        loading={props.isDeleteInProgress}
        icon="Delete"
      >
        Delete file
      </Button>
    </Popconfirm>
  </div>
);

const Review = () => {
  const [isDeleteInProgress, setIsDeleteInProgress] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useThunkDispatch();
  const { fileId } = useParams<{ fileId: string }>();
  const { state } = useLocation();

  const file = useSelector(({ fileReducer }: RootState) =>
    selectFileById(fileReducer, +fileId!)
  );

  const reviewFileIds = useSelector(
    ({ reviewSlice }: RootState) => reviewSlice.fileIds
  );

  const previousPage = (state as { from?: string })?.from;
  const showBackButton = !!previousPage || false;

  const onBackButtonClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Wraps around the dispatch call so that we can await for the deletion to finish.
  const deleteFileById = async () => {
    return dispatch(
      DeleteFilesById({
        fileIds: [file!.id],
        setIsDeletingState: setIsDeleteInProgress,
      })
    );
  };

  const handleFileDelete = useCallback(async () => {
    // go to previous page if in single file review
    if (reviewFileIds.length <= 1) {
      await deleteFileById();
      onBackButtonClick();
    } else {
      // go to previous image if in multi file review
      const currentIndex = reviewFileIds.indexOf(file!.id);
      const nextIndex =
        currentIndex - 1 < 0 ? currentIndex + 1 : currentIndex - 1;

      navigate(
        getParamLink(
          workflowRoutes.review,
          ':fileId',
          String(reviewFileIds[nextIndex])
        ),
        { replace: true }
      );
      await deleteFileById();
    }
  }, [
    reviewFileIds,
    onBackButtonClick,
    navigate,
    previousPage,
    file,
    setIsDeleteInProgress,
  ]);

  useEffect(() => {
    batch(() => {
      dispatch(resetEditHistory());
      dispatch(resetPreview());
    });
    if (fileId && !reviewFileIds.includes(+fileId)) {
      batch(() => {
        dispatch(PopulateReviewFiles([+fileId]));
        dispatch(FetchFilesById([+fileId]));
      });
    }

    if (file) {
      dispatch(RetrieveAnnotations({ fileIds: [+fileId!], clearCache: true }));
    }
    // reset notifications
    notification.destroy();
  }, [file, fileId, reviewFileIds]);

  useEffect(() => {
    dispatch(FetchFilesById(reviewFileIds));
  }, [reviewFileIds]);

  useEffect(() => {
    pushMetric('Vision.Review');
    dispatch(PopulateAnnotationTemplates());
  }, []);

  const clearProcessData = useCallback(() => {
    dispatch(PopulateProcessFiles([]));
    return true;
  }, []);

  const renderView = useMemo(() => {
    if (file) {
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
                      onClick={onBackButtonClick}
                    >
                      <Icon type="ChevronLeftSmall" />
                      Back
                    </Button>
                  ) : (
                    <></>
                  )
                }
                right={
                  <DeleteButton
                    onConfirm={handleFileDelete}
                    isDeleteInProgress={isDeleteInProgress}
                  />
                }
              />
            </ToolBar>
            <ReviewBody file={file} prev={previousPage} />
          </Container>
        </>
      );
    }
    return null;
  }, [
    file,
    previousPage,
    showBackButton,
    onBackButtonClick,
    handleFileDelete,
    isDeleteInProgress,
  ]);

  if (!file) {
    return null;
  }

  return (
    <>
      {/* <CustomPrompt when={previousPage === 'process'} onOK={clearProcessData} /> */}
      {renderView}
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
