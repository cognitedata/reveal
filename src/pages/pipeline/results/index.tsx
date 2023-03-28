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
import PipelineRunResultsTable from 'components/pipeline-run-results-table';

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

  const { data: emPipelineRun, isInitialLoading } = useEMPipelineRun(
    parseInt(pipelineId ?? ''),
    parseInt(jobId ?? ''),
    {
      enabled: !!pipelineId && !!jobId,
    }
  );

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  if (isInitialLoading) {
    return (
      <Page subtitle={pipeline?.description} title={pipeline?.name ?? ''}>
        <Step
          title={t('result-step-title', { step: 4 })}
          subtitle={t('result-step-subtitle')}
        >
          <Loader />
        </Step>
      </Page>
    );
  }

  if (!emPipelineRun) {
    return (
      <Page subtitle={pipeline?.description} title={pipeline?.name ?? ''}>
        <Step
          title={t('result-step-title', { step: 4 })}
          subtitle={t('result-step-subtitle')}
        >
          run not found (TODO)
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
          <PipelineRunResultsTable pipeline={pipeline} run={emPipelineRun} />
        </Step>
      </Page>
    );
  }

  return <></>;
};

export default PipelineResults;
