import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Step from 'components/step';
import { Pipeline, useRunEMPipeline } from 'hooks/entity-matching-pipelines';
import { createLink } from '@cognite/cdf-utilities';

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

  return <Step isCentered>run</Step>;
};

export default Run;
