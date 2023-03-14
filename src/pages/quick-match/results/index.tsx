import { useTranslation } from 'common';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/contextualization-api';
import { useParams } from 'react-router-dom';

const QuickMatchResults = (): JSX.Element => {
  const { jobId } = useParams<{
    jobId: string;
  }>();

  const { t } = useTranslation();

  const { data: predictions } = useEMModelPredictResults(
    parseInt(jobId ?? ''),
    {
      enabled: !!jobId,
    }
  );

  return (
    <Page subtitle={t('results')} title={t('quick-match')}>
      {predictions?.status === 'Completed' && !!predictions?.items && (
        <EntityMatchingResult predictions={predictions.items} />
      )}
    </Page>
  );
};

export default QuickMatchResults;
