import { useTranslation } from 'common';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import {
  IN_PROGRESS_EM_STATES,
  useEMModelPredictResults,
} from 'hooks/contextualization-api';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const QuickMatchResults = (): JSX.Element => {
  const { jobId } = useParams<{
    jobId: string;
  }>();

  const { t } = useTranslation();

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
    <Page subtitle={t('results')} title={t('quick-match')}>
      {predictions?.status === 'Completed' && !!predictions?.items && (
        <EntityMatchingResult predictions={predictions.items} />
      )}
    </Page>
  );
};

export default QuickMatchResults;
