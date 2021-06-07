import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

import { Title } from '@cognite/cogs.js';

import { selectAllFiles } from 'src/modules/Common/filesSlice';
import styled from 'styled-components';

import { annotationsById } from 'src/modules/Review/previewSlice';
import FileUploadedIcon from 'src/assets/FileUploadedIcon.svg';
import FileBland from 'src/assets/FileBland.svg';
import FileWithExifIcon from 'src/assets/FileWithExifIcon.svg';
import FileWithAnnotations from 'src/assets/FileWithAnnotations.svg';
import FileUnresolvedPerson from 'src/assets/FileUnresolvedPerson.svg';
import FileWasReviewed from 'src/assets/FileWasReviewed.svg';

const queryClient = new QueryClient();

export default function SummaryStep() {
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const [statView, setStatView] = useState('totalFilesUploaded');

  const annotations = useSelector((state: RootState) => {
    return annotationsById(state.previewSlice);
  });
  console.log('Here annotations', Object.values(annotations));

  const personFiles: number[] = [];
  const reviewStats: number[] = [];
  const textNumber: number[] = [];
  const objectNumber: number[] = [];
  const tagNumber: number[] = [];

  // eslint-disable-next-line array-callback-return
  Object.entries(annotations).map((arr) => {
    const aID = arr[1].annotatedResourceId;
    if (arr[1].status !== 'unhandled' && !reviewStats.includes(aID)) {
      reviewStats.push(aID);
    }
    if (arr[1].label === 'person' && !personFiles.includes(aID)) {
      personFiles.push(aID);
    }
    if (arr[1].source === 'vision/ocr' && !textNumber.includes(aID)) {
      textNumber.push(aID);
    }
    if (
      arr[1].source === 'vision/objectdetection' &&
      !objectNumber.includes(aID)
    ) {
      objectNumber.push(aID);
    }
    if (arr[1].source === 'vision/tagdetection' && !tagNumber.includes(aID)) {
      tagNumber.push(aID);
    }
  });

  const NotReviewedPersonFiles = personFiles.filter(
    (file) => !reviewStats.includes(file)
  );
  let filesWithExif = 0;
  // eslint-disable-next-line array-callback-return
  Object.entries(uploadedFiles).map((file) => {
    if (file[1]?.metadata || file[1]?.geoLocation) {
      filesWithExif += 1;
    }
  });
  const totalAnnotations =
    tagNumber.length + textNumber.length + objectNumber.length;
  const tagPercent = Math.round((tagNumber.length / totalAnnotations) * 100);
  const textPercent = Math.round((textNumber.length / totalAnnotations) * 100);
  const objectPercent = 100 - textPercent - tagPercent;

  const stats = {
    totalFilesUploaded: {
      text: 'total files processed',
      value: uploadedFiles?.length,
    },
    filesWithExif: { text: 'files with exif', value: filesWithExif },
    userReviewedFiles: {
      text: 'user-reviewed files',
      value: reviewStats.length,
    },
    modelDetections: {
      text: 'files with tags, texts or objects ',
      value: totalAnnotations,
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
                        <img src={FileUploadedIcon} alt="FileIcon" />
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
                <StatsCarouselRightDivider>
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
                  {totalAnnotations > 0 && (
                    <DetectionStats>
                      <PercentBar
                        percentage1={tagPercent}
                        percentage2={textPercent}
                        percentage3={objectPercent}
                        count1={tagNumber.length}
                        count2={textNumber.length}
                        count3={objectNumber.length}
                      />
                    </DetectionStats>
                  )}
                </StatsCarouselRightDivider>
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
                  {stats[statView].value < personFiles.length &&
                    Array.from(
                      {
                        length: personFiles.length - stats[statView].value,
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

export const PercentBar = (props: {
  percentage1: number;
  percentage2: number;
  percentage3: number;
  count1?: number;
  count2?: number;
  count3?: number;
}) => {
  return (
    <DetectionDetailsContainer>
      <PercentBarStyle>
        <Filler
          percentage1={props.percentage1}
          percentage2={props.percentage2}
          percentage3={props.percentage3}
        />
      </PercentBarStyle>
      <PercentBarStyle>
        <Title
          level={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#fc4a72',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${props.percentage1}%`,
          }}
        >
          {props.percentage1}%<br />
          <div
            style={{
              fontSize: '8px',
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {props.count1} file{!!props.count1 && props.count1 !== 1 && 's'}
          </div>
        </Title>
        <Title
          level={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#ff8746',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${props.percentage2}%`,
          }}
        >
          {props.percentage2}%<br />
          <div
            style={{
              fontSize: '8px',
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {props.count2} file{!!props.count2 && props.count2 !== 1 && 's'}
          </div>
        </Title>
        <Title
          level={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#f28fff',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${props.percentage3}%`,
          }}
        >
          {props.percentage3}%<br />
          <div
            style={{
              fontSize: '8px',
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {props.count3} file{!!props.count3 && props.count3 !== 1 && 's'}
          </div>
        </Title>
      </PercentBarStyle>
    </DetectionDetailsContainer>
  );
};

const Filler = (props: {
  percentage1: number;
  percentage2: number;
  percentage3: number;
}) => {
  return (
    <>
      <FillerStyleLeft style={{ width: `${props.percentage1}%` }} />
      <FillerStyleMid style={{ width: `${props.percentage2}%` }} />
      <FillerStyleRight style={{ width: `${props.percentage3}%` }} />
    </>
  );
};

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

const DetectionStats = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  justify-content: center;
`;

const DetectionDetailsContainer = styled.div`
  display: grid;
  grid-template-rows: 50% auto;
  align-items: center;
  justify-content: center;
`;

const StatsCarouselRightDivider = styled.div`
  display: grid;
  flex: 1 2 auto;
  grid-template-rows: auto 15%;
  border-radius: inherit;
  padding: 1em;
  overflow-y: auto;
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
  background: var(--cogs-greyscale-grey2);
  border: none;
  border-radius: 10px;
  padding: 1rem;
`;

const PercentBarStyle = styled.div`
  display: flex;
  height: 15px;
  width: 300px;
  margin: 10px;
  border-radius: 2px 0px 0px 2px;
`;

const FillerStyleLeft = styled.div`
  background: #fc4a72;
  height: 100%;
  transition: width 0.2s ease-in;
`;

const FillerStyleRight = styled.div`
  background: #f28fff;
  height: 100%;
  transition: width 0.2s ease-in;
`;

const FillerStyleMid = styled.div`
  background: #ff8746;
  height: 100%;
  transition: width 0.2s ease-in;
`;
