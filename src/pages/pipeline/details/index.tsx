import { Route, Routes, useParams } from 'react-router-dom';

import Page from 'components/page';

import Sources from './sources';
import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import { useEMPipeline } from 'hooks/entity-matching-pipelines';

const PipelineDetails = (): JSX.Element => {
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
        subtitle={pipeline?.description ?? '-'}
        title={pipeline?.name ?? ''}
      >
        <Routes>
          <Route path="/sources" element={<Sources pipeline={pipeline} />} />
        </Routes>
      </Page>
    );
  }

  return <></>;
};

export default PipelineDetails;
