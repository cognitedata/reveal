import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

import { Title } from '@cognite/cogs.js';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';

import { selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';

import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { createLink } from '@cognite/cdf-utilities';
import { annotationsById } from 'src/store/previewSlice';
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

  console.log('uploadedFiles ->', uploadedFiles);
  const [statView, setStatView] = useState('totalFilesUploaded');

  const dispatch = useDispatch();
  const onNextClicked = () => {
    dispatch(SaveAvailableAnnotations());
    history.push(createLink('/explore/search/file')); // data-exploration app
  };
  // eslint-disable-next-line prettier/prettier
  // eslint-disable-next-line dot-notation
  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });
  let GDPRCases = 0;

  console.log('annotations: ', annotations);
  // eslint-disable-next-line array-callback-return
  Object.entries(annotations).map((arr) => {
    if (arr[1].label === 'person') {
      GDPRCases += 1;
    }
    console.log('label:', arr[1].label);
  });

  let filesWithExif = 0;
  // eslint-disable-next-line array-callback-return
  Object.entries(uploadedFiles).map((file) => {
    if (file[1]?.metadata || file[1]?.geoLocation) {
      filesWithExif += 1;
    }
  });

  const stats = {
    totalFilesUploaded: {
      text: 'Total files uploaded',
      value: uploadedFiles?.length, // ok
    },
    filesWithExif: { text: 'Files with exif', value: filesWithExif }, // ok
    userReviewedFiles: { text: 'User-Reviewed files', value: 23 }, // need reviewed stat
    modelDetections: {
      text: 'Model Detection',
      value: Object.keys(annotations).length, // ok?
    },
    gdprCases: { text: 'GDPR Cases', value: GDPRCases }, // need to do resolved out of total
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process summary</Title>
        <Container>
          <CarouselContainer>
            <StatsCarouselContainer>
              <StatsCarouselLeft>
                {Object.entries(stats).map((pair) => (
                  <FancyButton
                    onClick={() => {
                      setStatView(pair[0]);
                      console.log('Just set statView:', statView);
                    }}
                  >
                    {pair[1].text} : {pair[1].value}
                  </FancyButton>
                ))}
              </StatsCarouselLeft>
              {statView === 'totalFilesUploaded' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <FileIconContainer>
                      <img src={FileIcon} alt="FileIcon" />
                    </FileIconContainer>
                  ))}
                </StatsCarouselRight>
              )}
              {statView === 'filesWithExif' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <FileIconContainer>
                      <img src={FileWithExifIcon} alt="FileWithExifIcon" />
                    </FileIconContainer>
                  ))}
                  {stats[statView].value < stats.totalFilesUploaded.value &&
                    Array.from(
                      {
                        length:
                          stats.totalFilesUploaded.value -
                          stats[statView].value,
                      },
                      () => (
                        <FileIconContainer>
                          <img src={FileBland} alt="FileBland" />
                        </FileIconContainer>
                      )
                    )}
                </StatsCarouselRight>
              )}
              {statView === 'userReviewedFiles' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <FileIconContainer>
                      <img src={FileWasReviewed} alt="FileWasReviewed" />
                    </FileIconContainer>
                  ))}
                  {stats[statView].value < stats.totalFilesUploaded.value &&
                    Array.from(
                      {
                        length:
                          stats.totalFilesUploaded.value -
                          stats[statView].value,
                      },
                      () => (
                        <FileIconContainer>
                          <img src={FileBland} alt="FileBland" />
                        </FileIconContainer>
                      )
                    )}
                </StatsCarouselRight>
              )}
              {statView === 'modelDetections' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <FileIconContainer>
                      <img
                        src={FileWithAnnotations}
                        alt="FileWithAnnotations"
                      />
                    </FileIconContainer>
                  ))}
                </StatsCarouselRight>
              )}
              {statView === 'gdprCases' && (
                <StatsCarouselRight>
                  {Array.from({ length: stats[statView].value }, () => (
                    <FileIconContainer>
                      <img src={FileResolvedGDPR} alt="FileResolvedGDPR" />
                    </FileIconContainer>
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
  padding: 1em;
  padding-right: 105px;
`;

const FileIconContainer = styled.div`
  margin-top: auto;
  padding: 5px;
  bottom: 0px;
`;

const FancyButton = styled.button`
  background: white;
  border: none;
  border-radius: 10px;
  padding: 1rem;
`;
