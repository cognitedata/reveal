import { Loader } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import ApplySelectedMatchesButton from 'components/apply-selected-matches-button/ApplySelectedMatchesButton';
import EntityMatchingResult from 'components/em-result';
import Page from 'components/page';
import { useEMModelPredictResults } from 'hooks/entity-matching-predictions';
import { useApplyRulesResults } from 'hooks/entity-matching-rules';

import { INFINITE_Q_OPTIONS } from 'hooks/infiniteList';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { SourceType } from 'types/api';
import {
  sessionStorageApplyRulesJobKey,
  sessionStoragePredictJobKey,
} from 'utils';

const QuickMatchResults = (): JSX.Element => {
  const [confirmedPredictions, setConfirmedPredictions] = useState<number[]>(
    []
  );
  const {
    subAppPath,
    predictJobId: predictJobIdStr,
    applyRulesJobId: applyRulesJobIdStr,
    sourceType,
  } = useParams<{
    subAppPath: string;
    predictJobId: string;
    rulesJobId?: string;
    applyRulesJobId?: string;
    sourceType: SourceType;
  }>();

  const { t } = useTranslation();
  const predictJobId = parseInt(predictJobIdStr ?? '', 10);
  const applyRulesJobId = parseInt(applyRulesJobIdStr ?? '', 10);

  const predictJobToken = sessionStorage.getItem(
    sessionStoragePredictJobKey(predictJobId)
  );

  const applyRulesJobToken = sessionStorage.getItem(
    sessionStorageApplyRulesJobKey(applyRulesJobId)
  );

  const { data: predictions, isInitialLoading: loadingPredictions } =
    useEMModelPredictResults(predictJobId, predictJobToken, {
      enabled: !!predictJobId,
      ...INFINITE_Q_OPTIONS,
    });

  const { data: appliedRules, isInitialLoading: loadingAppliedRules } =
    useApplyRulesResults(applyRulesJobId, applyRulesJobToken, {
      enabled: !!applyRulesJobId,
      ...INFINITE_Q_OPTIONS,
    });

  if (!sourceType) {
    return <Navigate to={`/${subAppPath}/quick-match/}`} replace={true} />;
  }

  if (loadingPredictions || loadingAppliedRules) {
    return <Loader />;
  }

  return (
    <>
      {!!predictions?.items && (
        <Page
          subtitle={t('results')}
          title={t('quick-match')}
          extraContent={
            <ApplySelectedMatchesButton
              predictions={predictions.items}
              confirmedPredictions={confirmedPredictions}
              predictionJobId={predictJobId}
              sourceType={sourceType}
            />
          }
        >
          {predictions?.status === 'Completed' && (
            <EntityMatchingResult
              predictJobId={predictJobId}
              sourceType={sourceType}
              predictions={predictions.items}
              confirmedPredictions={confirmedPredictions}
              setConfirmedPredictions={setConfirmedPredictions}
              appliedRules={appliedRules?.items}
            />
          )}
        </Page>
      )}
    </>
  );
};

export default QuickMatchResults;
