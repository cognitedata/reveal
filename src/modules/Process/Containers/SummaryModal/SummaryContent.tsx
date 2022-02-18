import React, { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import FileUploadedIcon from 'src/assets/FileUploadedIcon.svg';
import FileBland from 'src/assets/FileBland.svg';
import FileWithExifIcon from 'src/assets/FileWithExifIcon.svg';
import FileWithAnnotations from 'src/assets/FileWithAnnotations.svg';
import FileUnresolvedPerson from 'src/assets/FileUnresolvedPerson.svg';
import FileWasReviewed from 'src/assets/FileWasReviewed.svg';
import { selectProcessSummary } from 'src/modules/Process/store/selectors';
import { calculateSummaryStats } from 'src/modules/Process/utils';

const queryClient = new QueryClient();

export default function SummaryContent() {
  const [statView, setStatView] = useState('totalFiles');

  const processSummary = useSelector((rootState: RootState) =>
    selectProcessSummary(rootState)
  );

  const stats = useMemo(
    () => calculateSummaryStats(processSummary),
    [processSummary]
  );

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

              {statView === 'totalFiles' && (
                <StatsCarouselRight key={statView}>
                  <RenderFileIcons
                    length={stats[statView].value}
                    icon={FileUploadedIcon}
                    iconAlt="FileIcon"
                    keyString={statView}
                  />
                </StatsCarouselRight>
              )}

              {statView === 'filesWithExif' && (
                <StatsCarouselRight key={statView}>
                  <RenderFileIcons
                    length={stats[statView].value}
                    icon={FileWithExifIcon}
                    iconAlt="FileWithExifIcon"
                    keyString={statView}
                  />
                  {stats[statView].value < stats.totalFiles.value && (
                    <RenderFileIcons
                      length={stats.totalFiles.value - stats[statView].value}
                      icon={FileBland}
                      iconAlt="FileBland"
                      keyString="filesWithoutExif"
                    />
                  )}
                </StatsCarouselRight>
              )}

              {statView === 'filesUserReviewed' && (
                <StatsCarouselRight key={statView}>
                  <RenderFileIcons
                    length={stats[statView].value}
                    icon={FileWasReviewed}
                    iconAlt="FileWasReviewed"
                    keyString={statView}
                  />
                  {stats[statView].value < stats.totalFiles.value && (
                    <RenderFileIcons
                      length={stats.totalFiles.value - stats[statView].value}
                      icon={FileBland}
                      iconAlt="FileBland"
                      keyString="notUserReviewedFiles"
                    />
                  )}
                </StatsCarouselRight>
              )}

              {statView === 'filesWithModelDetections' && (
                <StatsCarouselRightDivider>
                  <StatsCarouselRight key={statView}>
                    <RenderFileIcons
                      length={stats[statView].value}
                      icon={FileWithAnnotations}
                      iconAlt="FileWithAnnotations"
                      keyString={statView}
                    />
                    {stats[statView].value < stats.totalFiles.value && (
                      <RenderFileIcons
                        length={stats.totalFiles.value - stats[statView].value}
                        icon={FileBland}
                        iconAlt="FileBland"
                        keyString="filesWithoutModelDetections"
                      />
                    )}
                  </StatsCarouselRight>
                  {stats.totalFiles.value > 0 && (
                    <DetectionStats>
                      <PercentBar
                        tagPercentage={
                          stats[statView].filesWithAssets.percentage
                        }
                        textPercentage={
                          stats[statView].filesWithText.percentage
                        }
                        objectPercentage={
                          stats[statView].filesWithObjects.percentage
                        }
                        tagCount={stats[statView].filesWithAssets.count}
                        textCount={stats[statView].filesWithText.count}
                        objectCount={stats[statView].filesWithObjects.count}
                      />
                    </DetectionStats>
                  )}
                </StatsCarouselRightDivider>
              )}
              {statView === 'filesWithUnresolvedPersonCases' && (
                <StatsCarouselRight key={statView}>
                  <RenderFileIcons
                    length={stats[statView].value}
                    icon={FileUnresolvedPerson}
                    iconAlt="FileUnresolvedPerson"
                    keyString={statView}
                  />
                  {stats[statView].value < stats.totalFiles.value && (
                    <RenderFileIcons
                      length={stats.totalFiles.value - stats[statView].value}
                      icon={FileBland}
                      iconAlt="FileBland"
                      keyString="notPersonCases"
                    />
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

export const RenderFileIcons = ({
  length,
  icon,
  iconAlt,
  keyString,
}: {
  length: number;
  icon: string;
  iconAlt: string;
  keyString: string;
}) => {
  return (
    <>
      {Array.from({ length }, (_, i: number) => (
        <FileIconContainer key={`${keyString}_${i}`}>
          <img src={icon} alt={iconAlt} />
        </FileIconContainer>
      ))}
    </>
  );
};

export const PercentBar = (props: {
  tagPercentage: number;
  textPercentage: number;
  objectPercentage: number;
  tagCount?: number;
  textCount?: number;
  objectCount?: number;
}) => {
  return (
    <DetectionDetailsContainer>
      <PercentBarStyle>
        <Filler
          tagPercentage={props.tagPercentage}
          textPercentage={props.textPercentage}
          objectPercentage={props.objectPercentage}
        />
      </PercentBarStyle>
      <PercentBarStyle>
        <Title
          level={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#e3a1ec',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${props.tagPercentage}%`,
          }}
        >
          {props.tagPercentage !== 0 && (
            <>
              {props.tagPercentage}%
              <br />
            </>
          )}
          <div
            style={{
              fontSize: '8px',
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {!!props.tagCount && props.tagCount !== 0 && (
              <div>
                {props.tagCount} file
                {!!props.tagCount && props.tagCount !== 1 && 's'}
              </div>
            )}
          </div>
        </Title>
        <Title
          level={6}
          style={{
            display: 'flex',
            flexDirection: 'column',
            color: '#05b8a6',
            justifyContent: 'center',
            alignItems: 'center',
            width: `${props.textPercentage}%`,
          }}
        >
          {props.textPercentage !== 0 && (
            <>
              {props.textPercentage}%<br />
            </>
          )}
          <div
            style={{
              fontSize: '8px',
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {!!props.textCount && props.textCount !== 0 && (
              <>
                {props.textCount} file
                {!!props.textCount && props.textCount !== 1 && 's'}
              </>
            )}
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
            width: `${props.objectPercentage}%`,
          }}
        >
          {props.objectPercentage !== 0 && (
            <>
              {props.objectPercentage}%<br />
            </>
          )}
          <div
            style={{
              fontSize: '8px',
              display: 'flex',
              justifyContent: 'center',
              minWidth: 'max-content',
            }}
          >
            {!!props.objectCount && props.objectCount !== 0 && (
              <>
                {props.objectCount} file
                {!!props.objectCount && props.objectCount !== 1 && 's'}{' '}
              </>
            )}
          </div>
        </Title>
      </PercentBarStyle>
    </DetectionDetailsContainer>
  );
};

const Filler = (props: {
  tagPercentage: number;
  textPercentage: number;
  objectPercentage: number;
}) => {
  return (
    <>
      <FillerStyleLeft style={{ width: `${props.tagPercentage}%` }} />
      <FillerStyleMid style={{ width: `${props.textPercentage}%` }} />
      <FillerStyleRight style={{ width: `${props.objectPercentage}%` }} />
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
  padding: 1em 105px 1em 1em;
  align-items: flex-start;
`;

const FileIconContainer = styled.div`
  margin-top: auto;
  padding: 5px;
  bottom: 0;
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
  border-radius: 2px 0 0 2px;
`;

const FillerStyleLeft = styled.div`
  background: #e3a1ec;
  height: 100%;
  transition: width 0.2s ease-in;
`;

const FillerStyleRight = styled.div`
  background: #ff8746;
  height: 100%;
  transition: width 0.2s ease-in;
`;

const FillerStyleMid = styled.div`
  background: #05b8a6;
  height: 100%;
  transition: width 0.2s ease-in;
`;
