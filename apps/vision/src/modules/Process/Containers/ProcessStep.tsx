import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

// import { CustomPrompt } from '@vision/modules/Common/Components/CustomPrompt/CustomPrompt';
import { Title } from '@cognite/cogs.js';

import { useThunkDispatch } from '../../../store';
import { RootState } from '../../../store/rootReducer';
import { PopulateProcessFiles } from '../../../store/thunks/Process/PopulateProcessFiles';
import { pushMetric } from '../../../utils/pushMetric';
import { zIndex } from '../../../utils/zIndex';
import { ViewMode } from '../../Common/types';
import {
  hideFileMetadata,
  setCurrentView,
  setFocusedFileId,
} from '../store/slice';

import { ExploreModalContainer } from './ExploreModalContainer';
import { FileToolbar } from './FileToolbar';
import { ProcessBulkEditModalContainer } from './ProcessBulkEditModalContainer';
import { ProcessFileDownloadModalContainer } from './ProcessFileDownloadModalContainer';
import { ProcessFileUploadModalContainer } from './ProcessFileUploadModalContainer';
import { ProcessFooter } from './ProcessFooter';
import { ProcessResults } from './ProcessResults';
import { ProcessToolBar } from './ProcessToolBar/ProcessToolBar';

const ResultsContainer = styled.div`
  flex: 1;
  overflow: hidden;
  z-index: ${zIndex.DEFAULT};
`;

const TitleContainer = styled.div`
  padding: 5px 0;
`;

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
