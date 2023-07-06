import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { CustomPrompt } from '@vision/modules/Common/Components/CustomPrompt/CustomPrompt';
import { ViewMode } from '@vision/modules/Common/types';
import { ExploreModalContainer } from '@vision/modules/Process/Containers/ExploreModalContainer';
import { FileToolbar } from '@vision/modules/Process/Containers/FileToolbar';
import { ProcessBulkEditModalContainer } from '@vision/modules/Process/Containers/ProcessBulkEditModalContainer';
import { ProcessFileDownloadModalContainer } from '@vision/modules/Process/Containers/ProcessFileDownloadModalContainer';
import { ProcessFileUploadModalContainer } from '@vision/modules/Process/Containers/ProcessFileUploadModalContainer';
import { ProcessFooter } from '@vision/modules/Process/Containers/ProcessFooter';
import { ProcessResults } from '@vision/modules/Process/Containers/ProcessResults';
import { ProcessToolBar } from '@vision/modules/Process/Containers/ProcessToolBar/ProcessToolBar';
import {
  hideFileMetadata,
  setCurrentView,
  setFocusedFileId,
} from '@vision/modules/Process/store/slice';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { PopulateProcessFiles } from '@vision/store/thunks/Process/PopulateProcessFiles';
import { pushMetric } from '@vision/utils/pushMetric';
import { zIndex } from '@vision/utils/zIndex';

import { Title } from '@cognite/cogs.js';

const ResultsContainer = styled.div`
  flex: 1;
  overflow: hidden;
  z-index: ${zIndex.DEFAULT};
`;

const TitleContainer = styled.div`
  padding: 5px 0;
`;

const queryClient = new QueryClient();

export default function ProcessStep() {
  const dispatch = useThunkDispatch();

  const processFileIds = useSelector(
    (state: RootState) => state.processSlice.fileIds
  );

  const currentView = useSelector(
    ({ processSlice }: RootState) => processSlice.currentView
  );

  useEffect(() => {
    pushMetric('Vision.Process');
    return () => {
      dispatch(hideFileMetadata());
    };
  }, []);

  const clearProcessData = () => {
    dispatch(PopulateProcessFiles([]));
    return true;
  };
  return (
    <>
      {/* <CustomPrompt when={!!processFileIds.length} onOK={clearProcessData} /> */}
      <Deselect />
      <ProcessFileUploadModalContainer />
      <ProcessFileDownloadModalContainer />
      <QueryClientProvider client={queryClient}>
        <TitleContainer>
          <Title level={2}>Contextualize Imagery Data</Title>
        </TitleContainer>
        <ProcessToolBar />
        <FileToolbar
          currentView={currentView}
          onViewChange={(view) => dispatch(setCurrentView(view as ViewMode))}
        />
        <ResultsContainer>
          <ProcessResults currentView={currentView as ViewMode} />
        </ResultsContainer>
        <ProcessFooter />
        <ExploreModalContainer />
        <ProcessBulkEditModalContainer />
      </QueryClientProvider>
    </>
  );
}

const Deselect = () => {
  const dispatch = useThunkDispatch();
  const focusedFileId = useSelector(
    ({ processSlice }: RootState) => processSlice.focusedFileId
  );
  return (
    <DeselectContainer
      onClick={() => {
        if (focusedFileId) {
          dispatch(setFocusedFileId(null));
        }
      }}
    />
  );
};

const DeselectContainer = styled.div`
  position: fixed;
  z-index: ${zIndex.DESELECT_CONTAINER};
  inset: 97px 0 0 0;
`;
