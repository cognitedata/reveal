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

const PIPELINE_STEPS = [
  'sources',
  'targets',
  'configure-pipeline',
  'run',
] as const;
type PipelineStep = (typeof PIPELINE_STEPS)[number];

const getNextStep = (current?: string): PipelineStep | undefined => {
  const step = PIPELINE_STEPS.find((item) => current?.includes(item));
  switch (step) {
    case 'sources':
      return 'targets';
    case 'targets':
      return 'configure-pipeline';
    case 'configure-pipeline':
      return 'run';
    case 'run':
      return undefined;
    default:
      return undefined;
  }
};

const getPrevStep = (current?: string): PipelineStep | undefined => {
  const step = PIPELINE_STEPS.find((item) => current?.includes(item));
  switch (step) {
    case 'run':
      return undefined;
    case 'configure-pipeline':
      return 'targets';
    case 'targets':
      return 'sources';
    case 'sources':
      return undefined;
    default:
      return undefined;
  }
};

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

  const nextStep = getNextStep(step);
  const prevStep = getPrevStep(step);

  const navigate = useNavigate();

  const handleGoNextStep = () => {
    navigate(
      createLink(`/${subAppPath}/pipeline/${pipeline?.id}/details/${nextStep}`),
      {
        replace: true,
      }
    );
  };

  const handleGoPrevStep = () => {
    navigate(
      createLink(`/${subAppPath}/pipeline/${pipeline?.id}/details/${prevStep}`),
      {
        replace: true,
      }
    );
  };

  const configurePipeline =
    window.location.href.indexOf('configure-pipeline') !== -1;

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
            {prevStep && (
              <Button onClick={handleGoPrevStep}>{t('navigate-back')}</Button>
            )}
            {nextStep && (
              <Button onClick={handleGoNextStep} type="primary">
                {configurePipeline ? t('run-model') : t('navigate-next')}
              </Button>
            )}
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
