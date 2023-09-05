import styled from 'styled-components';

import { Chip } from '@cognite/cogs.js';

import { JobStatus } from '../../../types';

import { ImproveYourScore } from './ImproveYourScore';
import { PercentageChip } from './PercentageChip';

export const ContextualizationScoreTab = ({
  headerName,
  dataModelType,
  estimateQualityJobStatus,
  contextualizationScorePercent,
  estimatedCorrectnessScorePercent,
  confidencePercent,
}: {
  headerName: string;
  dataModelType: string;
  estimateQualityJobStatus: JobStatus | undefined;
  contextualizationScorePercent: number | undefined;
  estimatedCorrectnessScorePercent: number | undefined;
  confidencePercent: number | undefined;
}) => {
  return (
    <Container>
      <Row>
        <Chip
          hideTooltip={true}
          size="small"
          label="Contextualization score"
          type="neutral"
        />
        :
        <PercentageChip
          value={contextualizationScorePercent}
          status={estimateQualityJobStatus}
        />
      </Row>
      <Row>
        <Chip
          hideTooltip={true}
          size="small"
          label="Estimated correctness:"
          type="neutral"
        />
        :
        <PercentageChip
          value={estimatedCorrectnessScorePercent}
          status={estimateQualityJobStatus}
        />
      </Row>
      <Row>
        <Chip
          hideTooltip={true}
          size="small"
          label="Confidence:"
          type="neutral"
        />
        :
        <PercentageChip
          value={confidencePercent}
          status={estimateQualityJobStatus}
        />
      </Row>
      <ButtonWrapper>
        <ImproveYourScore
          headerName={headerName}
          dataModelType={dataModelType}
        />
      </ButtonWrapper>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  margin-top: 5px;
`;
