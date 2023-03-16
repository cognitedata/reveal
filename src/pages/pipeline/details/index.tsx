import { Route, Routes, useParams } from 'react-router-dom';

import Page from 'components/page';
import { useEMPipeline } from 'hooks/contextualization-api';

import Sources from './sources';
import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';

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

  return (
    <Page subtitle={pipeline?.description ?? '-'} title={pipeline?.name ?? ''}>
      <Routes>
        <Route path="/sources" element={<Sources />} />
      </Routes>
    </Page>
  );
};

export default PipelineDetails;
