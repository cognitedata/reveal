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
import { Icon } from '@cognite/cogs.js';

type RunProps = {
  pipeline: Pipeline;
};

const Run = ({ pipeline }: RunProps): JSX.Element => {
  const { subAppPath, jobId } = useParams<{
    subAppPath: string;
    jobId?: string;
  }>();

  const navigate = useNavigate();

  const { mutateAsync: runEMPipeline } = useRunEMPipeline();

  const [emPipelineRunRefetchInterval, setEmPipelineRunRefetchInterval] =
    useState<number | undefined>();
  const jobIdAsNumber = parseInt(jobId ?? '');
  const { data: emPipelineRun } = useEMPipelineRun(pipeline.id, jobIdAsNumber, {
    enabled: !!jobId,
    refetchInterval: emPipelineRunRefetchInterval,
  });

  useEffect(() => {
    if (!jobId) {
      runEMPipeline({ id: pipeline.id }).then(({ jobId: jId }) => {
        navigate(
          createLink(`/${subAppPath}/pipeline/${pipeline?.id}/run/${jId}`),
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

  return (
    <Step isCentered>
      <Icon type="Loader" />
    </Step>
  );
};

export default Run;
