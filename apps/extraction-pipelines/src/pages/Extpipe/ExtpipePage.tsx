import React, { FunctionComponent } from 'react';
import { useParams, Route, Routes } from 'react-router-dom';

import { Loader } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { ErrorBox } from '../../components/error/ErrorBox';
import ConfigurationRevision from '../../components/extpipe/ConfigurationRevision';
import { ExtpipeDetails } from '../../components/extpipe/ExtpipeDetails';
import ExtpipeRunHistory from '../../components/extpipe/ExtpipeRunHistory';
import { ExtpipeBreadcrumbs } from '../../components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { RunFilterProvider } from '../../hooks/runs/RunsFilterContext';
import { useSelectedExtpipe } from '../../hooks/useExtpipe';
import { HEALTH_PATH, RouterParams } from '../../routing/RoutingConfig';

const ExtpipePageComponent: FunctionComponent = () => {
  const { t } = useTranslation();
  const { id } = useParams<RouterParams>();

  const { data: extpipe, isInitialLoading, error } = useSelectedExtpipe();

  if (isInitialLoading) {
    return <Loader />;
  }

  if (error || !extpipe) {
    return (
      <div>
        <ExtpipeBreadcrumbs />
        <ErrorBox heading={t('ext-pipeline-not-found', { id })}>
          <p>{t('ext-pipeline-not-found-desc')}</p>
        </ErrorBox>
      </div>
    );
  }

  return (
    <RunFilterProvider>
      <div>
        <Routes>
          <Route path="/" element={<ExtpipeDetails />} />
          <Route path={`/${HEALTH_PATH}`} element={<ExtpipeRunHistory />} />
          <Route path="/config/:revision" element={<ConfigurationRevision />} />
        </Routes>
      </div>
    </RunFilterProvider>
  );
};

const ExtpipePage = () => {
  return <ExtpipePageComponent />;
};

export default ExtpipePage;
