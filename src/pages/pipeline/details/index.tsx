import { Route, Routes, useParams } from 'react-router-dom';

import Page from 'components/page';
import { useEMPipeline } from 'hooks/contextualization-api';

import Sources from './sources';

const PipelineDetails = (): JSX.Element => {
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();

  const { data: pipeline } = useEMPipeline(parseInt(pipelineId ?? ''), {
    enabled: !!pipelineId,
  });

  return (
    <Page subtitle={pipeline?.description ?? '-'} title={pipeline?.name ?? ''}>
      <Routes>
        <Route path="/sources" element={<Sources />} />
      </Routes>
    </Page>
  );
};

export default PipelineDetails;
