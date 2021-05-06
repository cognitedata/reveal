import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

import { Title } from '@cognite/cogs.js';

import { selectAllFiles } from 'src/modules/Upload/uploadedFilesSlice';
import styled from 'styled-components';

import { annotationsById } from 'src/modules/Preview/previewSlice';
import FileIcon from './assets/FileIcon.svg';
import FileBland from './assets/FileBland.svg';
import FileWithExifIcon from './assets/FileWithExifIcon.svg';
import FileWithAnnotations from './assets/FileWithAnnotations.svg';
import FileUnresolvedPerson from './assets/FileUnresolvedPerson.svg';
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
  const PersonFiles: number[] = [];
  const reviewStats: number[] = [];
  // eslint-disable-next-line array-callback-return
  Object.entries(annotations).map((arr) => {
    const aID = arr[1].annotatedResourceId;
    if (arr[1].status !== 'unhandled' && !reviewStats.includes(aID)) {
      reviewStats.push(aID);
    }
    if (arr[1].label === 'person' && !PersonFiles.includes(aID)) {
      PersonFiles.push(aID);
    }
  });

  const NotReviewedPersonFiles = PersonFiles.filter(
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
      text: 'total files uploaded',
      value: uploadedFiles?.length,
    },
    filesWithExif: { text: 'files with exif', value: filesWithExif },
    userReviewedFiles: {
      text: 'user-reviewed files',
      value: reviewStats.length,
    },
    modelDetections: {
      text: 'detected tags, texts and objects ',
      value: Object.keys(annotations).length,
    },
    personCases: {
      text: 'unresolved person detections',
      value: NotReviewedPersonFiles.length,
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
                  <>
                    {statView === pair[0] && (
                      <FancyButton
                        key={`${pair[0]}_focused`}
                        style={{
                          background: 'rgba(74, 103, 251, 0.1)',
                        }}
                        onClick={() => {
                          setStatView(pair[0]);
                        }}
                      >
                        <table>
                          <tbody>
                            <tr>
                              <td key={`${pair[0]}-tabular-data1`}>
                                <b
                                  style={{
                                    fontSize: '20px',
                                    paddingRight: '5px',
                                  }}
                                >
                                  {pair[1].value}
                                </b>
                              </td>
                              <td key={`${pair[0]}-tabular-data2`}>
                                {pair[1].text}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </FancyButton>
                    )}
                    {statView !== pair[0] && (
                      <FancyButton
                        key={`${pair[0]}`}
                        onClick={() => {
                          setStatView(pair[0]);
                        }}
                      >
                        <table>
                          <tbody>
                            <tr>
                              <td>
                                <b
                                  style={{
                                    fontSize: '20px',
                                    paddingRight: '5px',
                                  }}
                                >
                                  {pair[1].value}
                                </b>
                              </td>
                              <td>{pair[1].text}</td>
                            </tr>
                          </tbody>
                        </table>
                      </FancyButton>
                    )}
                  </>
                ))}
              </StatsCarouselLeft>

              {statView === 'totalFilesUploaded' && (
                <StatsCarouselRight key={statView}>
                  {Array.from(
                    { length: stats[statView].value },
                    (_, i: number) => (
                      <FileIconContainer key={`${statView}_${i}`}>
                        <img src={FileIcon} alt="FileIcon" />
                      </FileIconContainer>
                    )
                  )}
                </StatsCarouselRight>
              )}

              {statView === 'filesWithExif' && (
                <StatsCarouselRight key={statView}>
                  {stats[statView].value < stats.totalFilesUploaded.value &&
                    Array.from(
                      {
                        length:
                          stats.totalFilesUploaded.value -
                          stats[statView].value,
                      },
                      (_, i: number) => (
                        <FileIconContainer key={`filesWithoutExif_${i}`}>
                          <img src={FileBland} alt="FileBland" />
                        </FileIconContainer>
                      )
                    )}
                  {Array.from(
                    { length: stats[statView].value },
                    (_, i: number) => (
                      <FileIconContainer key={`${statView}_${i}`}>
                        <img src={FileWithExifIcon} alt="FileWithExifIcon" />
                      </FileIconContainer>
                    )
                  )}
                </StatsCarouselRight>
              )}

              {statView === 'userReviewedFiles' && (
                <StatsCarouselRight key={statView}>
                  {Array.from(
                    { length: stats[statView].value },
                    (_, i: number) => (
                      <FileIconContainer key={`${statView}_${i}`}>
                        <img src={FileWasReviewed} alt="FileWasReviewed" />
                      </FileIconContainer>
                    )
                  )}
                  {stats[statView].value < stats.totalFilesUploaded.value &&
                    Array.from(
                      {
                        length:
                          stats.totalFilesUploaded.value -
                          stats[statView].value,
                      },
                      (_, i: number) => (
                        <FileIconContainer key={`notUserReviewedFiles_${i}`}>
                          <img src={FileBland} alt="FileBland" />
                        </FileIconContainer>
                      )
                    )}
                </StatsCarouselRight>
              )}

              {statView === 'modelDetections' && (
                <StatsCarouselRight key={statView}>
                  {Array.from(
                    { length: stats[statView].value },
                    (_, i: number) => (
                      <FileIconContainer key={`${statView}_${i}`}>
                        <img
                          src={FileWithAnnotations}
                          alt="FileWithAnnotations"
                        />
                      </FileIconContainer>
                    )
                  )}
                </StatsCarouselRight>
              )}
              {statView === 'personCases' && (
                <StatsCarouselRight key={statView}>
                  {Array.from(
                    { length: stats[statView].value },
                    (_, i: number) => (
                      <FileIconContainer key={`${statView}_${i}`}>
                        <img
                          src={FileUnresolvedPerson}
                          alt="FileUnresolvedPerson"
                        />
                      </FileIconContainer>
                    )
                  )}
                  {stats[statView].value < PersonFiles.length &&
                    Array.from(
                      {
                        length: PersonFiles.length - stats[statView].value,
                      },
                      (_, i: number) => (
                        <FileIconContainer key={`notPersonCases__${i}`}>
                          <img src={FileBland} alt="FileBland" />
                        </FileIconContainer>
                      )
                    )}
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
  overflow-y: auto;
`;
const StatsCarouselLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
  padding: 1em;
  padding-right: 105px;
  align-items: flex-start;
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
