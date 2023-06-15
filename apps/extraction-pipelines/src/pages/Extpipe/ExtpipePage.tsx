import React, { FunctionComponent } from 'react';
import { useParams, Route, Routes } from 'react-router-dom';

import { useTranslation } from '@extraction-pipelines/common';
import { ErrorBox } from '@extraction-pipelines/components/error/ErrorBox';
import ConfigurationRevision from '@extraction-pipelines/components/extpipe/ConfigurationRevision';
import { ExtpipeDetails } from '@extraction-pipelines/components/extpipe/ExtpipeDetails';
import ExtpipeRunHistory from '@extraction-pipelines/components/extpipe/ExtpipeRunHistory';
import { ExtpipeBreadcrumbs } from '@extraction-pipelines/components/navigation/breadcrumbs/ExtpipeBreadcrumbs';
import { RunFilterProvider } from '@extraction-pipelines/hooks/runs/RunsFilterContext';
import { useSelectedExtpipe } from '@extraction-pipelines/hooks/useExtpipe';
import {
  HEALTH_PATH,
  RouterParams,
} from '@extraction-pipelines/routing/RoutingConfig';

import { Loader } from '@cognite/cogs.js';

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
