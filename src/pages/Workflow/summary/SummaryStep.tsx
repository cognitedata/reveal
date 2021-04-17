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
import { Button, Title } from '@cognite/cogs.js';
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
import { margin } from 'src/cogs-variables';
import { PrevNextNav } from '../components/PrevNextNav';
import FileIcon from './assets/FileIcon.svg';
import FileBland from './assets/FileBland.svg';
import FileWithExifIcon from './assets/FileWithExifIcon.svg';
import FileWithAnnotations from './assets/FileWithAnnotations.svg';
import FileResolvedGDPR from './assets/FileResolvedGDPR.svg';
import FileWasReviewed from './assets/FileWasReviewed.svg';

const queryClient = new QueryClient();

export default function SummaryStep() {
  const history = useHistory();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  const [currentView, setCurrentView] = useState<string>('list');
  const [statView, setStatView] = useState('totalFilesUploaded');

  const dispatch = useDispatch();
  const onNextClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(createLink('/explore/search/file')); // data-exploration app
  };
  // update with actual data
  const stats = {
    totalFilesUploaded: { text: 'Total files uploaded', value: 29 },
    filesWithExif: { text: 'Files with exif', value: 25 },
    userReviewedFiles: { text: 'User-Reviewed files', value: 23 },
    modelDetections: { text: 'Model Detection', value: 420 },
    gdprCases: { text: 'GDPR Cases', value: 12 },
  };
  // eslint-disable-next-line prettier/prettier
  // eslint-disable-next-line dot-notation

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
  console.log('here', uploadedFiles.length, uploadedFiles);
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process summary</Title>
        <Container>
          <CarouselContainer>
            <StatsCarouselContainer>
              <StatsCarouselLeft>
                {Object.entries(stats).map((pair) => (
                  <Button
                    onClick={() => {
                      setStatView(pair[0]);
                      console.log('Just set statView:', statView);
                    }}
                  >
                    {pair[1].text} : {pair[1].value}
                  </Button>
                ))}
              </StatsCarouselLeft>
              {statView === 'totalFilesUploaded' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <img src={FileIcon} alt="FileIcon" />
                  ))}
                </StatsCarouselRight>
              )}
              {statView === 'filesWithExif' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <img src={FileWithExifIcon} alt="FileWithExifIcon" />
                  ))}
                  {stats[statView].value < stats.totalFilesUploaded.value &&
                    Array.from(
                      {
                        length:
                          stats.totalFilesUploaded.value -
                          stats[statView].value,
                      },
                      () => (
                        <img
                          style={{ marginTop: 'auto' }}
                          src={FileBland}
                          alt="FileBland"
                        />
                      )
                    )}
                </StatsCarouselRight>
              )}
              {statView === 'userReviewedFiles' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <img src={FileWasReviewed} alt="FileWasReviewed" />
                  ))}
                  {stats[statView].value < stats.totalFilesUploaded.value &&
                    Array.from(
                      {
                        length:
                          stats.totalFilesUploaded.value -
                          stats[statView].value,
                      },
                      () => <img src={FileBland} alt="FileBland" />
                    )}
                </StatsCarouselRight>
              )}
              {statView === 'modelDetections' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <img src={FileWithAnnotations} alt="FileWithAnnotations" />
                  ))}
                </StatsCarouselRight>
              )}
              {statView === 'gdprCases' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <img src={FileResolvedGDPR} alt="FileResolvedGDPR" />
                  ))}
                </StatsCarouselRight>
              )}
            </StatsCarouselContainer>
          </CarouselContainer>
          <PrevNextNav
            prevBtnProps={{
              onClick: () => history.push(getLink(workflowRoutes.upload)),
              disabled: false,
              children: 'Upload more',
            }}
            skipBtnProps={{
              disabled: false,
              children: 'Continue processing files',
            }}
            nextBtnProps={{
              onClick: onNextClicked,
              disabled: false,
              children: 'Finish processing',
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

const CarouselContainer = styled.div`
  display: flex;
`;

const StatsCarouselContainer = styled.div`
  display: flex;
  justify-content: center;
  border-radius: 1em;
  border-width: 1em;
  flex: 1 1 auto;
`;

const StatsCarouselRight = styled.div`
  display: grid;
  flex: 1 2 auto;
  grid-template-columns: repeat(auto-fit, minmax(20px, 40px));
  grid-template-rows: repeat(5, 1fr);
  border-radius: inherit;
  padding: 1em;
  width: 40rem;
  max-height: 20rem;
  overflow: scroll;
`;
const StatsCarouselLeft = styled.div`
  display: grid;
  grid-template-columns: 1 fr;
  grid-template-rows: repeat(5, 1fr);
  justify-content: center;
  overflow: auto;
  padding: 1em;
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
