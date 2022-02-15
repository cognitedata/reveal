/* eslint-disable @cognite/no-number-z-index */
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import React from 'react';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { hideFileMetadata } from 'src/modules/Process/store/slice';

export const ProcessFileDetailsContainer = () => {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();
  const history = useHistory();
  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );
  const showFileDetails = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadata
  );

  const onClose = () => {
    dispatch(hideFileMetadata());
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
