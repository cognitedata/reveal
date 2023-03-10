import { Route, Routes, useParams } from 'react-router-dom';

import { useTranslation } from 'common';
import Page from 'components/page';

import Sources from './sources';

const PipelineDetails = (): JSX.Element => {
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();

  const { t } = useTranslation();

  return (
    <Page subtitle={pipelineId} title={t('pipeline')}>
      <Routes>
        <Route path="/sources" element={<Sources />} />
      </Routes>
    </Page>
  );
};

export default PipelineDetails;
