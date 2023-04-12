import { Route, Routes, useNavigate, useParams } from 'react-router-dom';

import { Button, Flex } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { createLink } from '@cognite/cdf-utilities';

import Page from 'components/page';
import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import { useEMPipeline } from 'hooks/entity-matching-pipelines';

import Sources from './sources';
import Targets from './targets';
import ConfigurePipeline from './configure-pipeline';
import Run from './run';
import { usePipelineContext } from 'context/PipelineContext';
import { useContextState } from 'utils';
import { Filter, RawSource, RawTarget, SourceType } from 'types/api';
import { useEffect } from 'react';

const PIPELINE_STEPS = [
  'sources',
  'targets',
  'configure-pipeline',
  'run',
] as const;
type PipelineStep = (typeof PIPELINE_STEPS)[number];

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

  const getPipelineStepOrder = (step?: string): number => {
    const index = PIPELINE_STEPS.findIndex((value) => value === step);
    return index;
  };
  console.log(pipeline?.targets);
  const hasSources = pipeline ? pipeline?.sources.dataSetIds.length > 0 : false;
  const hasTargets = pipeline ? pipeline?.targets.dataSetIds.length > 0 : false;

  const stepDone = () => {
    switch (step) {
      case 'sources': {
        return hasSources;
      }
      case 'targets': {
        return hasTargets;
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
              <Button disabled={!hasPrevStep()} onClick={handleGoPrevStep}>
                {t('navigate-back')}
              </Button>
            )}
            <Button
              disabled={!hasNextStep()}
              onClick={handleGoNextStep}
              type="primary"
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
