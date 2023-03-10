import { Route, Routes } from 'react-router-dom';

import { useTranslation } from 'common';
import Page from 'components/page';

import SelectSources from './select-sources';

const PipelineCreate = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Page subtitle={t('create')} title={t('pipeline')}>
      <Routes>
        <Route path="/select-sources" element={<SelectSources />} />
      </Routes>
    </Page>
  );
};

export default PipelineCreate;
