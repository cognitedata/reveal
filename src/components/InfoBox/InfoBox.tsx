import React, { useState } from 'react';
import { Button, Icon, Title, Graphic } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

interface InfoBoxProps {
  infoType: 'TagHelpBox' | 'TimeSeriesHelpBox';
  query: string;
}

interface InfoBoxData {
  title: string;
  body: any;
}
const timeSeriesInfo: InfoBoxData = {
  title: 'Timeseries ID',
  body: (
    <>
      You can search for Timeseries name (ID) e.g. VAL_21_ZT_1018_04:Z.X.Value
      or Timeseries description, e.g. Utløpstrykk pigsluse eksportlinje B.
      {'\n\n'}
      Read more on
      <a href="cog.link/charts-doc"> cog.link/charts-doc.</a>
    </>
  ),
};

const tagInfo: InfoBoxData = {
  title: 'Search Tag numbers',
  body: (
    <>
      Search for Tag number (asset) e.g. 21PT1019 or description (e.g. LAUN TO
      OIL TRANS LN B){'\n\n'}
      Read more on
      <a href="cog.link/charts-doc"> cog.link/charts-doc.</a>
    </>
  ),
};

const InfoBox = ({ infoType, query }: InfoBoxProps) => {
  const [displayInfo, setDisplayInfo] = useState(
    localStorage ? !localStorage.getItem(infoType) : true
  );

  const data = infoType === 'TagHelpBox' ? tagInfo : timeSeriesInfo;

  const handleOnClick = () => {
    localStorage.setItem(infoType, JSON.stringify({ display: false }));
    setDisplayInfo(false);
  };

  return (
    <InfoBoxContainer style={query === '' ? { height: '100%' } : {}}>
      {displayInfo && (
        <InfoBoxWrapper>
          <StyledIcon type="InfoFilled" />
          <InfoWrapper>
            <StyledTitle level={5}>{data.title}</StyledTitle>
            <TextContainer>{data.body}</TextContainer>
          </InfoWrapper>
          <Button
            icon="Close"
            size="small"
            type="ghost"
            style={{ width: '1.65em', height: '1.65em' }}
            onClick={handleOnClick}
          />
        </InfoBoxWrapper>
      )}
      {query === '' && (
        <EmptyResultsContainer>
          <EmptyResults>
            <Graphic
              type={infoType === 'TagHelpBox' ? 'Documents' : 'Timeseries'}
            />
            <div style={{ marginTop: 20 }}>
              {infoType === 'TagHelpBox'
                ? 'Search for Tag numbers or Asset names'
                : 'Search for Time series ID'}
            </div>
            <div>those might look like this:</div>
            <EmptyResultsExample>
              {infoType === 'TagHelpBox' ? '21PT1019' : 'IA_21PT1019.PV'}
            </EmptyResultsExample>
          </EmptyResults>
        </EmptyResultsContainer>
      )}
    </InfoBoxContainer>
  );
};

const InfoBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoBoxWrapper = styled.div`
  width: initial;
  display: flex;
  flex-direction: row;
  margin: 5px 5px 10px 0;
  padding: 1em;
  min-height: 200px;
  background-color: #f6f9ff;
  border: 1px solid var(--cogs-midblue-5);
  border-radius: 0.5em;
`;

const TextContainer = styled.div`
  margin-top: 1em;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  width: fit-content;
  white-space: pre-line;
`;

const InfoWrapper = styled.div`
  width: max-content;
  flex: 1;
  padding: 0 1em;
`;

const StyledTitle = styled(Title)`
  color: var(--cogs-text-primary);
`;

const StyledIcon = styled(Icon)`
  color: var(--cogs-text-accent);
`;

const EmptyResultsContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
  justify-content: center;
`;

const EmptyResults = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cogs-greyscale-grey3);
  border-radius: 8px;
  align-items: center;
  padding: 36px 30px;
  text-align: center;
  color: var(--cogs-greyscale-grey6);
  align-self: center;
  width: 70%;
  justify-self: center;
`;

const EmptyResultsExample = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-top: 16px;
`;

export default InfoBox;
