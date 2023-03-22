import { useTranslation } from 'common';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/contextualization-api';
import { INFINITE_Q_OPTIONS } from 'hooks/infiniteList';
import { Navigate, useParams } from 'react-router-dom';
import { SourceType } from 'types/api';
import { sessionStorageKey } from 'utils';

const QuickMatchResults = (): JSX.Element => {
  const { subAppPath, jobId, sourceType } = useParams<{
    subAppPath: string;
    jobId: string;
    sourceType: SourceType;
  }>();

  const { t } = useTranslation();
  const id = parseInt(jobId ?? '', 10);
  const jobToken = sessionStorage.getItem(sessionStorageKey(id));

  const { data: predictions } = useEMModelPredictResults(id, jobToken, {
    enabled: !!jobId,
    ...INFINITE_Q_OPTIONS,
  });

  if (!sourceType) {
    return <Navigate to={`/${subAppPath}/quick-match/}`} replace={true} />;
  }

  return (
    <Page subtitle={t('results')} title={t('quick-match')}>
      {predictions?.status === 'Completed' && !!predictions?.items && (
        <EntityMatchingResult
          sourceType={sourceType}
          predictions={predictions.items}
        />
      )}
    </Page>
  );
};

export default QuickMatchResults;
