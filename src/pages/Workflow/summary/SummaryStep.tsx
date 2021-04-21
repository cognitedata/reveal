import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

import { Title } from '@cognite/cogs.js';

import { selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';

import { annotationsById } from 'src/store/previewSlice';
import FileIcon from './assets/FileIcon.svg';
import FileBland from './assets/FileBland.svg';
import FileWithExifIcon from './assets/FileWithExifIcon.svg';
import FileWithAnnotations from './assets/FileWithAnnotations.svg';
import FileResolvedGDPR from './assets/FileResolvedGDPR.svg';
import FileWasReviewed from './assets/FileWasReviewed.svg';

const queryClient = new QueryClient();

export default function SummaryStep() {
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );

  const [statView, setStatView] = useState('totalFilesUploaded');

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });
  const GDPRFiles: number[] = [];
  const reviewStats: number[] = [];
  // eslint-disable-next-line array-callback-return
  Object.entries(annotations).map((arr) => {
    const aID = arr[1].annotatedResourceId;
    if (arr[1].status !== 'unhandled' && !reviewStats.includes(aID)) {
      reviewStats.push(aID);
    }
    if (arr[1].label === 'person' && !GDPRFiles.includes(aID)) {
      GDPRFiles.push(aID);
    }
  });

  const NotReviewedGDPRFiles = GDPRFiles.filter(
    (file) => !reviewStats.includes(file)
  );
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
      value: uploadedFiles?.length,
    },
    filesWithExif: { text: 'Files with exif', value: filesWithExif },
    userReviewedFiles: {
      text: 'User-Reviewed files',
      value: reviewStats.length,
    },
    modelDetections: {
      text: 'Model Detection',
      value: Object.keys(annotations).length,
    },
    gdprCases: {
      text: 'Unresolved GDPR Cases',
      value: NotReviewedGDPRFiles.length,
    },
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
  max-height: 18rem;
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
