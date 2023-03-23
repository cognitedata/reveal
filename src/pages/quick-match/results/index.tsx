import { useTranslation } from 'common';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/entity-matching-predictions';
import { useRulesResults } from 'hooks/entity-matching-rules';

import { INFINITE_Q_OPTIONS } from 'hooks/infiniteList';
import { Navigate, useParams } from 'react-router-dom';
import { SourceType } from 'types/api';
import { sessionStoragePredictJobKey, sessionStorageRulesJobKey } from 'utils';

const QuickMatchResults = (): JSX.Element => {
  const {
    subAppPath,
    predictJobId: predictJobIdStr,
    rulesJobId: rulesJobIdStr,
    sourceType,
  } = useParams<{
    subAppPath: string;
    predictJobId: string;
    rulesJobId: string;
    sourceType: SourceType;
  }>();

  const { t } = useTranslation();
  const predictJobId = parseInt(predictJobIdStr ?? '', 10);
  const rulesJobId = parseInt(rulesJobIdStr ?? '', 10);
  const predictJobToken = sessionStorage.getItem(
    sessionStoragePredictJobKey(predictJobId)
  );
  const rulesJobToken = sessionStorage.getItem(
    sessionStorageRulesJobKey(rulesJobId)
  );

  const { data: predictions } = useEMModelPredictResults(
    predictJobId,
    predictJobToken,
    {
      enabled: !!predictJobId,
      ...INFINITE_Q_OPTIONS,
    }
  );

  const { data: rules } = useRulesResults(rulesJobId, rulesJobToken, {
    enabled: !!rulesJobId,
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
          rules={rules?.rules}
        />
      )}
    </Page>
  );
};

export default QuickMatchResults;
