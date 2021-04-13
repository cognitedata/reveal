import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  FileActions,
  TableDataItem,
} from 'src/pages/Workflow/components/FileTable/FileTable';

import { FileToolbar } from 'src/pages/Workflow/components/FileToolbar';
import { Title } from '@cognite/cogs.js';
import {
  getLink,
  getParamLink,
  workflowRoutes,
} from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import {
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/store/processSlice';

import { GridCellProps, GridTable } from '@cognite/data-exploration';
import { resetEditHistory, selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';

import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { createLink } from '@cognite/cdf-utilities';
import { annotationsById } from 'src/store/previewSlice';
import { PrevNextNav } from '../components/PrevNextNav';

const queryClient = new QueryClient();

export default function SummaryStep() {
  const history = useHistory();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  console.log('Uploaded files: ', uploadedFiles);
  const [currentView, setCurrentView] = useState<string>('list');

  const dispatch = useDispatch();
  const onNextClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(createLink('/explore/search/file')); // data-exploration app
  };

  const stats = {
    totalFilesUploaded: 29,
    filesWithExif: 25,
    userReviewedFiles: 23,
    modelDetections: 420,
    gdprCases: 12,
  };

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });
  const annotationStats = { number: Object.keys(annotations).length };
  console.log(
    'annotations: ',
    annotations,
    ' | annotationStats: ',
    annotationStats
  );

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process summary</Title>
        <FileToolbar currentView={currentView} onViewChange={setCurrentView} />
        <Container>
          <h1>{Object.keys(stats).map((keys) => console.log(keys))}</h1>
          <h2>{Object.values(stats).map((vals) => console.log(vals))}</h2>
          <PrevNextNav
            prevBtnProps={{
              onClick: () => history.push(getLink(workflowRoutes.upload)),
              disabled: false,
              children: 'Up10ad m0r3',
              title: 'Upload more',
            }}
            skipBtnProps={{
              disabled: false,
              children: 'Continue processing files',
              title: 'Continue processing filez',
            }}
            nextBtnProps={{
              onClick: onNextClicked,
              disabled: false,
              children: 'Finish processing',
              title: 'F1n1sh pr0cess1ng',
            }}
          />
        </Container>
      </QueryClientProvider>
    </>
  );
}

const Container = styled.div`
  flex: 1;
`;

const StatsCarouselRight = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20px, 40px));
  grid-template-rows: repeat(5, 1fr);
  justify-content: center;
  overflow: auto;
`;
const StatsCarouselLeft = styled.div`
  display: grid;
  grid-template-columns: 1 fr;
  grid-template-rows: repeat(5, 1fr);
  justify-content: center;
  overflow: auto;
`;

const FileIconContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;
const StatsHeader = styled.div`
  display: flex;
  justify-content: left;
  font-size: 50px;
`;
const SummaryContainer = styled.div`
  display: flex;
  margin: auto;
  padding: 10px;
`;
