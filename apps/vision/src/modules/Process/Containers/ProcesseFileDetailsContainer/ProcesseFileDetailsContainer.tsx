import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FileDetails } from '@vision/modules/FileDetails/Containers/FileDetails';
import { hideFileMetadata } from '@vision/modules/Process/store/slice';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { getParamLink, workflowRoutes } from '@vision/utils/workflowRoutes';

export const ProcessFileDetailsContainer = () => {
  const queryClient = new QueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
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
      navigate(getParamLink(workflowRoutes.review, ':fileId', String(fileId)));
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
  z-index: 1;
`;
