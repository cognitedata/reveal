import styled from 'styled-components';

import { Chip } from '@cognite/cogs.js';

// ToDo(CXT-1307): move this to app
export const ScoreComponent = ({
  outputUncertainty,
  uncertainty,
  score = 0,
  percentageText = 'correct',
  isLoading = false,
}: {
  outputUncertainty?: boolean;
  uncertainty?: number;
  score?: number;
  percentageText?: string;
  unknown?: boolean;
  isLoading?: boolean;
}) => {
  const d_uncertainty = uncertainty || 0;
  const wrong = outputUncertainty ? 100 - score - d_uncertainty : 0;

  const scoreText = `${score}% ${percentageText}${
    outputUncertainty ? `${d_uncertainty}% uncertainty, ${wrong}% wrong` : ''
  }`;

  return (
    <ScoreContainer>
      {isLoading ? (
        <Chip hideTooltip={true} size="small" icon="Loader" />
      ) : (
        <>
          <div>{scoreText}</div>
          <ScoreBar scoreWidth={score} unknownWidth={d_uncertainty} />
        </>
      )}
    </ScoreContainer>
  );
};

const ScoreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 6px;
`;

const ScoreBar = styled.div<{ scoreWidth: number; unknownWidth: number }>`
  height: 8px;
  width: 100%;
  border-radius: 4px;
  border: 1px solid #d1d1d1;
  background: linear-gradient(
    90deg,
    #2b3a88 ${({ scoreWidth }) => scoreWidth}%,
    #acacac ${({ scoreWidth }) => scoreWidth}%,
    #acacac ${({ scoreWidth, unknownWidth }) => scoreWidth + unknownWidth}%,
    #ffffff ${({ scoreWidth, unknownWidth }) => scoreWidth + unknownWidth}%
  );
`;
