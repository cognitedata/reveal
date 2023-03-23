import { useTranslation } from 'common';
import ApplySelectedMatchesButton from 'components/apply-selected-matches-button/ApplySelectedMatchesButton';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/entity-matching-predictions';

import { INFINITE_Q_OPTIONS } from 'hooks/infiniteList';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { SourceType } from 'types/api';
import { sessionStoragePredictJobKey } from 'utils';

const QuickMatchResults = (): JSX.Element => {
  const [sourceIds, setSourceIds] = useState<number[]>([]);
  const {
    subAppPath,
    predictJobId: predictJobIdStr,
    sourceType,
  } = useParams<{
    subAppPath: string;
    predictJobId: string;
    rulesJobId: string;
    applyRulesJobId: string;
    sourceType: SourceType;
  }>();

  const { t } = useTranslation();
  const predictJobId = parseInt(predictJobIdStr ?? '', 10);

  const predictJobToken = sessionStorage.getItem(
    sessionStoragePredictJobKey(predictJobId)
  );

  const { data: predictions } = useEMModelPredictResults(
    predictJobId,
    predictJobToken,
    {
      enabled: !!predictJobId,
      ...INFINITE_Q_OPTIONS,
    }
  );

  if (!sourceType) {
    return <Navigate to={`/${subAppPath}/quick-match/}`} replace={true} />;
  }

  return (
    <>
      {!!predictions?.items && (
        <Page
          subtitle={t('results')}
          title={t('quick-match')}
          predictions={predictions.items}
          sourceIds={sourceIds}
          extraContent={
            <ApplySelectedMatchesButton
              predictions={predictions.items}
              sourceIds={sourceIds}
            />
          }
        >
          {predictions?.status === 'Completed' && (
            <EntityMatchingResult
              sourceType={sourceType}
              predictions={predictions.items}
              sourceIdsSecondaryTopBar={sourceIds}
              setSourceIdsSecondaryTopBar={setSourceIds}
            />
          )}
        </Page>
      )}
    </>
  );
};

export default QuickMatchResults;
