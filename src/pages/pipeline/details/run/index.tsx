import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Step from 'components/step';
import {
  Pipeline,
  useEMPipelineRun,
  useRunEMPipeline,
} from 'hooks/entity-matching-pipelines';
import { createLink } from '@cognite/cdf-utilities';
import { IN_PROGRESS_EM_STATES } from 'hooks/types';
import { Flex, Infobox } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import QueryStatusIcon from 'components/QueryStatusIcon';

type RunProps = {
  pipeline: Pipeline;
};

const Run = ({ pipeline }: RunProps): JSX.Element => {
  const { subAppPath, jobId } = useParams<{
    subAppPath: string;
    jobId?: string;
  }>();

  const { t } = useTranslation();

  const navigate = useNavigate();

  const { mutateAsync: runEMPipeline, status: runEMPipelineStatus } =
    useRunEMPipeline();

  const [emPipelineRunRefetchInterval, setEmPipelineRunRefetchInterval] =
    useState<number | undefined>();
  const jobIdAsNumber = parseInt(jobId ?? '');
  const { data: emPipelineRun } = useEMPipelineRun(pipeline.id, jobIdAsNumber, {
    enabled: !!jobId,
    refetchInterval: emPipelineRunRefetchInterval,
  });

  const createJobStatus = jobId ? 'success' : runEMPipelineStatus;

  useEffect(() => {
    if (!jobId) {
      runEMPipeline({ id: pipeline.id }).then(({ jobId: jId }) => {
        navigate(
          createLink(
            `/${subAppPath}/pipeline/${pipeline?.id}/details/run/${jId}`
          ),
          { replace: true }
        );
      });
    }
  }, [navigate, jobId, pipeline.id, runEMPipeline, subAppPath]);

  useEffect(() => {
    if (
      emPipelineRun?.status &&
      IN_PROGRESS_EM_STATES.includes(emPipelineRun?.status)
    ) {
      setEmPipelineRunRefetchInterval(1000);
    } else {
      setEmPipelineRunRefetchInterval(undefined);
    }
  }, [emPipelineRun, emPipelineRunRefetchInterval, jobId]);

  useEffect(() => {
    if (
      emPipelineRun?.status &&
      !IN_PROGRESS_EM_STATES.includes(emPipelineRun?.status)
    ) {
      navigate(
        createLink(
          `/${subAppPath}/pipeline/${pipeline?.id}/results/${emPipelineRun.jobId}`
        ),
        { replace: true }
      );
    }
  }, [emPipelineRun, navigate, pipeline.id, subAppPath]);

  return (
    <Step isCentered>
      <Infobox
        showIcon={false}
        type="neutral"
        title={t('do-not-leave-the-page-pipeline')}
      >
        <Flex alignItems="center" gap={8}>
          <QueryStatusIcon status={createJobStatus} />
          {t(`create-job-${jobId ? 'success' : createJobStatus}`)}
        </Flex>
        <Flex alignItems="center" gap={8}>
          <QueryStatusIcon status={emPipelineRun?.status} />
          {t(`running-job-${emPipelineRun?.status}`)}
        </Flex>
      </Infobox>
    </Step>
  );
};

export default Run;
