import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { Body, Flex, Loader, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../../common';
import ApplySelectedMatchesButton from '../../../components/apply-selected-matches-button/ApplySelectedMatchesButton';
import EntityMatchingResult from '../../../components/em-result';
import NoAccessPage from '../../../components/error-pages/NoAccess';
import { Container, Graphic } from '../../../components/InfoBox';
import Page from '../../../components/page';
import Step from '../../../components/step';
import { useEMModel } from '../../../hooks/entity-matching-models';
import { useEMModelPredictResults } from '../../../hooks/entity-matching-predictions';
import { useApplyRulesResults } from '../../../hooks/entity-matching-rules';
import { INFINITE_Q_OPTIONS } from '../../../hooks/infiniteList';
import { SourceType } from '../../../types/api';
import {
  sessionStorageApplyRulesJobKey,
  sessionStoragePredictJobKey,
} from '../../../utils';

const QuickMatchResults = (): JSX.Element => {
  const [confirmedPredictions, setConfirmedPredictions] = useState<number[]>(
    []
  );
  const {
    subAppPath,
    modelId: modelIdStr,
    predictJobId: predictJobIdStr,
    applyRulesJobId: applyRulesJobIdStr,
    sourceType,
  } = useParams<{
    subAppPath: string;
    modelId: string;
    predictJobId: string;
    rulesJobId?: string;
    applyRulesJobId?: string;
    sourceType: SourceType;
  }>();

  const { t } = useTranslation();
  const modelId = parseInt(modelIdStr ?? '', 10);
  const predictJobId = parseInt(predictJobIdStr ?? '', 10);
  const applyRulesJobId = parseInt(applyRulesJobIdStr ?? '', 10);

  const predictJobToken = sessionStorage.getItem(
    sessionStoragePredictJobKey(predictJobId)
  );

  const applyRulesJobToken = sessionStorage.getItem(
    sessionStorageApplyRulesJobKey(applyRulesJobId)
  );

  const { data: model } = useEMModel(modelId!, {
    enabled: !!modelId,
    ...INFINITE_Q_OPTIONS, // models and prediction reponses can be _big_
  });

  const {
    data: predictions,
    isInitialLoading: loadingPredictions,
    error: predictJobError,
  } = useEMModelPredictResults(predictJobId, predictJobToken, {
    enabled: !!predictJobId,
    ...INFINITE_Q_OPTIONS,
  });

  const {
    data: appliedRules,
    isInitialLoading: loadingAppliedRules,
    error: appliedRulesError,
  } = useApplyRulesResults(applyRulesJobId, applyRulesJobToken, {
    enabled: !!applyRulesJobId,
    ...INFINITE_Q_OPTIONS,
  });

  if (!sourceType) {
    return <Navigate to={`/${subAppPath}/quick-match/}`} replace={true} />;
  }

  if (loadingPredictions || loadingAppliedRules) {
    return (
      <Page subtitle={t('results')} title={t('quick-match')}>
        <Step
          title={t('download-result-step-title', { step: 4 })}
          subtitle={t('download-result-step-subtitle')}
        >
          <Loader />
        </Step>
      </Page>
    );
  }

  if (predictJobError || appliedRulesError) {
    if (predictJobError?.status === 403 || appliedRulesError?.status === 403) {
      return (
        <Page subtitle={t('results')} title={t('quick-match')}>
          <Step>
            <NoAccessPage />
          </Step>
        </Page>
      );
    } else {
      return (
        <Page subtitle={t('results')} title={t('quick-match')}>
          <Step>
            <Container direction="row" justifyContent="space-between">
              <Flex direction="column" alignItems="flex-start">
                <Title level={4}>{t('unknown-error-title')}</Title>
                {predictJobError && (
                  <Body level={1}>{predictJobError.message}</Body>
                )}
                {appliedRulesError && (
                  <Body level={1}>{appliedRulesError.message}</Body>
                )}
              </Flex>
              <Graphic />
            </Container>
          </Step>
        </Page>
      );
    }
  }

  if (predictions?.items.length === 0) {
    return (
      <Page subtitle={t('results')} title={t('quick-match')}>
        <Step
          title={t('result-step-title', { step: 4 })}
          subtitle={t('result-step-subtitle')}
        >
          <Container direction="row" justifyContent="space-between">
            <Flex direction="column" alignItems="flex-start">
              <Title level={4}>{t('result-empty-title')}</Title>
              <Body level={1}>{t('result-empty-body')}</Body>
            </Flex>
            <Graphic />
          </Container>
        </Step>
      </Page>
    );
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
              sourceType={sourceType}
              model={model}
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
