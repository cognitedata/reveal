import React, { useEffect } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import { selectFileById } from 'src/modules/Common/store/filesSlice';
import { RootState } from 'src/store/rootReducer';
import { PopulateAnnotationTemplates } from 'src/store/thunks/Annotation/PopulateAnnotationTemplates';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import styled from 'styled-components';
import { Button, Icon, Popconfirm, ToastContainer } from '@cognite/cogs.js';
import { Prompt, RouteComponentProps, useHistory } from 'react-router-dom';
import { batch, useDispatch, useSelector } from 'react-redux';
import { resetPreview } from 'src/modules/Review/store/reviewSlice';
import ReviewBody from 'src/modules/Review/Containers/ReviewBody';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import { StatusToolBar } from 'src/modules/Process/Containers/StatusToolBar';
import { pushMetric } from 'src/utils/pushMetric';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';

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

  const file = useSelector(({ filesSlice }: RootState) =>
    selectFileById(filesSlice, +fileId)
  );

  const reviewFileIds = useSelector(
    ({ reviewSlice }: RootState) => reviewSlice.fileIds
  );

  const previousPage = (props.location.state as { from?: string })?.from;
  const showBackButton = !!previousPage || false;

  const onBackButtonClick = () => {
    history.goBack();
  };

  const handleFileDelete = () => {
    // go to previous page if in single file review
    if (reviewFileIds.length <= 1) {
      onBackButtonClick();
    } else {
      // go to previous image if in multi file review
      const currentIndex = reviewFileIds.indexOf(file!.id);
      const nextIndex =
        currentIndex - 1 < 0 ? currentIndex + 1 : currentIndex - 1;

      history.replace(
        getParamLink(
          workflowRoutes.review,
          ':fileId',
          String(reviewFileIds[nextIndex])
        ),
        { from: previousPage }
      );
    }
    dispatch(DeleteFilesById([file!.id]));
  };

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
      dispatch(RetrieveAnnotations({ fileIds: [+fileId], clearCache: true }));
    }
  }, [file, fileId, reviewFileIds]);

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
                    onClick={onBackButtonClick}
                  >
                    <Icon type="ChevronLeftCompact" />
                    Back
                  </Button>
                ) : (
                  <></>
                )
              }
              right={<DeleteButton onConfirm={handleFileDelete} />}
            />
          </ToolBar>
          <ReviewBody file={file} prev={previousPage} />
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
