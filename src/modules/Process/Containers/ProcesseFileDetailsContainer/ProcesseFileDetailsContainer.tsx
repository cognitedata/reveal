/* eslint-disable @cognite/no-number-z-index */
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { hideFileMetadataPreview } from 'src/modules/Process/processSlice';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import React from 'react';
import styled from 'styled-components';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';

export const ProcessFileDetailsContainer = () => {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();
  const history = useHistory();
  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );
  const showFileDetails = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadataDrawer
  );

  const onClose = () => {
    dispatch(hideFileMetadataPreview());
  };

  const onFileDetailReview = () => {
    if (fileId) {
      history.push(
        getParamLink(workflowRoutes.review, ':fileId', String(fileId)),
        { from: 'process' }
      );
    }
  };
  if (showFileDetails && fileId) {
    return (
      <Container>
        <QueryClientProvider client={queryClient}>
          <FileDetails
            fileId={fileId}
            onClose={onClose}
            onReview={onFileDetailReview}
          />
        </QueryClientProvider>
      </Container>
    );
  }
  return null;
};

const Container = styled.div`
  width: 400px;
  border-left: 1px solid #d9d9d9;
  box-sizing: content-box;
  flex-shrink: 0;
  height: 100%;
  overflow: auto;
  z-index: 1;
`;
