import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { hideFileMetadataPreview } from 'src/modules/Process/processSlice';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import React from 'react';
import styled from 'styled-components';
import { fetchFilesById } from 'src/store/thunks/fetchFilesById';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';

const Container = styled.div`
  width: 400px;
  border: 1px solid #d9d9d9;
  box-sizing: content-box;
  flex-shrink: 0;
  height: 100%;
  overflow: auto;
`;

export const ProcessFileDetailsContainer = () => {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();
  const history = useHistory();
  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );
  const showFileDetails = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadataDrawer
  );
  const onClose = () => {
    dispatch(hideFileMetadataPreview());
  };
  const onFileDetailReview = () => {
    if (fileId) {
      dispatch(fetchFilesById([{ id: fileId }]));
      history.push(
        getParamLink(workflowRoutes.review, ':fileId', String(fileId)),
        { from: 'process' }
      );
    }
  };
  if (showFileDetails) {
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
