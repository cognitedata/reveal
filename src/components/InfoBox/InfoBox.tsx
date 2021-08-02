import React from 'react';
import { Graphic } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { useRecentViewLocalStorage } from 'utils/recentViewLocalstorage';

interface InfoBoxProps {
  infoType: 'TagHelpBox' | 'TimeSeriesHelpBox';
  query: string;
}

const InfoBox = ({ infoType, query }: InfoBoxProps) => {
  const { data: rvResults } = useRecentViewLocalStorage(
    infoType === 'TagHelpBox' ? 'assets' : 'timeseries',
    []
  );
  const recentViewExists = !!rvResults && rvResults.length > 0;
  return (
    <InfoBoxContainer
      style={query === '' && !recentViewExists ? { height: '100%' } : {}}
    >
      {query === '' && !recentViewExists && (
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
