import { Button, Loader } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';

import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import Page from 'components/page';
import Step from 'components/step';
import {
  useEMPipeline,
  useEMPipelineRun,
} from 'hooks/entity-matching-pipelines';
import { useTranslation } from 'common';

type PipelineResultsProps = {};

const PipelineResults = ({}: PipelineResultsProps): JSX.Element => {
  const { t } = useTranslation();

  const { jobId, pipelineId } = useParams<{
    pipelineId: string;
    jobId: string;
  }>();

  const { data: pipeline, error } = useEMPipeline(parseInt(pipelineId ?? ''), {
    enabled: !!pipelineId,
  });

  const { data: emPipelineRun, isFetched: didFetchPipelineRun } =
    useEMPipelineRun(parseInt(pipelineId ?? ''), parseInt(jobId ?? ''), {
      enabled: !!pipelineId && !!jobId,
    });

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  if (!emPipelineRun) {
    return (
      <Page subtitle={pipeline?.description} title={pipeline?.name ?? ''}>
        <Step
          title={t('result-step-title', { step: 4 })}
          subtitle={t('result-step-subtitle')}
        >
          {didFetchPipelineRun ? 'run not found' : <Loader />}
        </Step>
      </Page>
    );
  }

  if (pipeline) {
    return (
      <Page
        extraContent={<Button type="primary">Apply (TODO)</Button>}
        subtitle={pipeline?.description}
        title={pipeline?.name ?? ''}
      >
        <Step
          title={t('result-step-title', { step: 4 })}
          subtitle={t('result-step-subtitle')}
        >
          results
        </Step>
      </Page>
    );
  }

  return <></>;
};

export default PipelineResults;
