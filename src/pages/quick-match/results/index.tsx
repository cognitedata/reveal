import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';
import EntityMatchingResult from 'components/em-result';
import {
  IN_PROGRESS_EM_STATES,
  useEMModelPredictResults,
} from 'hooks/contextualization-api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

const QuickMatchResults = (): JSX.Element => {
  const { jobId } = useParams<{
    jobId: string;
  }>();

  const [predictionRefetchInt, setPredictionRefetchInt] = useState<
    number | undefined
  >();

  const { data: predictions } = useEMModelPredictResults(
    parseInt(jobId ?? ''),
    {
      enabled: !!jobId,
      refetchInterval: predictionRefetchInt,
    }
  );

  const predictStatus = predictions?.status.toLowerCase();

  useEffect(() => {
    if (!predictStatus) {
      return;
    }
    if (IN_PROGRESS_EM_STATES.includes(predictStatus)) {
      setPredictionRefetchInt(1000);
    } else {
      setPredictionRefetchInt(undefined);
    }
  }, [predictStatus, predictionRefetchInt]);

  return (
    <Container>
      <SecondaryTopbar title="Quick match results" />
      <Content>
        {predictions?.status === 'Completed' && !!predictions?.items && (
          <EntityMatchingResult predictions={predictions.items} />
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
`;

const Content = styled.div`
  border-top: 1px solid ${Colors['border--interactive--default']};
  height: calc(100% - 56px);
  padding: 12px;
  overflow-y: auto;
`;

export default QuickMatchResults;
