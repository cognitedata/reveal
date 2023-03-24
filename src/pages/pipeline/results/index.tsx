import { Button } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';

import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import Page from 'components/page';
import Step from 'components/step';
import { useEMPipeline } from 'hooks/entity-matching-pipelines';

type PipelineResultsProps = {};

const PipelineResults = ({}: PipelineResultsProps): JSX.Element => {
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();

  const { data: pipeline, error } = useEMPipeline(parseInt(pipelineId ?? ''), {
    enabled: !!pipelineId,
  });

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  if (pipeline) {
    return (
      <Page
        extraContent={<Button type="primary">Apply (TODO)</Button>}
        subtitle={pipeline?.description}
        title={pipeline?.name ?? ''}
      >
        <Step>results</Step>
      </Page>
    );
  }

  return <></>;
};

export default PipelineResults;
