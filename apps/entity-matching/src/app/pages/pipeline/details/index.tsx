import { Route, Routes, useNavigate, useParams } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../../common';
import NoAccessPage from '../../../components/error-pages/NoAccess';
import UnknownErrorPage from '../../../components/error-pages/UnknownError';
import Page from '../../../components/page';
import { useEMPipeline } from '../../../hooks/entity-matching-pipelines';

import ConfigurePipeline from './configure-pipeline';
import Run from './run';
import Sources from './sources';
import Targets from './targets';

const PIPELINE_STEPS = [
  'sources',
  'targets',
  'configure-pipeline',
  'run',
] as const;

const PipelineDetails = (): JSX.Element => {
  const {
    '*': step,
    pipelineId,
    subAppPath,
  } = useParams<{
    '*': string;
    pipelineId: string;
    subAppPath: string;
  }>();

  const { t } = useTranslation();

  const { data: pipeline, error } = useEMPipeline(parseInt(pipelineId ?? ''), {
    enabled: !!pipelineId,
  });

  const navigate = useNavigate();

  const handleGoNextStep = () => {
    if (!hasNextStep()) {
      throw new Error('No futher steps');
    }
    const order = getPipelineStepOrder(step);
    const next = PIPELINE_STEPS[order + 1];
    navigate(
      createLink(`/${subAppPath}/pipeline/${pipeline?.id}/details/${next}`),
      {
        replace: true,
      }
    );
  };

  const handleGoPrevStep = () => {
    if (!hasPrevStep()) {
      throw new Error('No steps before this');
    }
    const order = getPipelineStepOrder(step);
    const next = PIPELINE_STEPS[order - 1];
    navigate(
      createLink(`/${subAppPath}/pipeline/${pipeline?.id}/details/${next}`),
      {
        replace: true,
      }
    );
  };

  const getPipelineStepOrder = (pipelineStep?: string): number => {
    const index = PIPELINE_STEPS.findIndex((value) => value === pipelineStep);
    return index;
  };

  const matchFields = pipeline?.modelParameters?.matchFields;
  const validMatchFields = matchFields?.filter(
    ({ source, target }: any) => !!source && !!target
  );

  const hasSources = pipeline ? pipeline?.sources.dataSetIds.length > 0 : false;
  const hasTargets = pipeline ? pipeline?.targets.dataSetIds.length > 0 : false;
  const hasValidMatchFields =
    pipeline && validMatchFields
      ? validMatchFields?.length > 0 &&
        validMatchFields?.length === matchFields?.length
      : false;

  const stepDone = () => {
    switch (step) {
      case 'sources': {
        return hasSources;
      }
      case 'targets': {
        return hasTargets;
      }
      case 'configure-pipeline': {
        return hasValidMatchFields;
      }
      default: {
        return true;
      }
    }
  };

  const hasNextStep = () => {
    const order = getPipelineStepOrder(step);
    return stepDone() && order >= 0 && order < PIPELINE_STEPS.length - 1;
  };

  const hasPrevStep = () => {
    const order = getPipelineStepOrder(step);
    return step !== 'run' && order > 0 && order < PIPELINE_STEPS.length;
  };

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  if (pipeline) {
    return (
      <Page
        extraContent={
          <Flex gap={8}>
            {hasPrevStep() && (
              <Button onClick={handleGoPrevStep} data-testid="back-button">
                {t('navigate-back')}
              </Button>
            )}
            <Button
              disabled={!hasNextStep()}
              onClick={handleGoNextStep}
              type="primary"
              data-testid="next-button"
            >
              {t('navigate-next')}
            </Button>
          </Flex>
        }
        subtitle={pipeline?.description ?? '-'}
        title={pipeline?.name ?? ''}
      >
        <Routes>
          <Route path="/sources" element={<Sources pipeline={pipeline} />} />
          <Route path="/targets" element={<Targets pipeline={pipeline} />} />
          <Route
            path="/configure-pipeline"
            element={<ConfigurePipeline pipeline={pipeline} />}
          />
          <Route path="/run/:jobId?" element={<Run pipeline={pipeline} />} />
        </Routes>
      </Page>
    );
  }

  return <></>;
};

export default PipelineDetails;
