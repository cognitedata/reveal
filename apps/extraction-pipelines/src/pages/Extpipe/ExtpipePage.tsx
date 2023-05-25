import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router';
import { Loader } from '@cognite/cogs.js';

import { Route, Routes } from 'react-router-dom';

import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { ExtpipeDetails } from 'components/extpipe/ExtpipeDetails';
import { HEALTH_PATH, RouterParams } from 'routing/RoutingConfig';
import ExtpipeRunHistory from 'components/extpipe/ExtpipeRunHistory';

import { RunFilterProvider } from 'hooks/runs/RunsFilterContext';
import { ExtpipeBreadcrumbs } from 'components/navigation/breadcrumbs/ExtpipeBreadcrumbs';

import { ErrorBox } from 'components/error/ErrorBox';

import { useTranslation } from 'common';
import ConfigurationRevision from 'components/extpipe/ConfigurationRevision';

interface ExtpipePageProps {}

const ExtpipePageComponent: FunctionComponent<ExtpipePageProps> = () => {
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
          <Route
            path={`/config/:revision`}
            element={<ConfigurationRevision />}
          />
        </Routes>
      </div>
    </RunFilterProvider>
  );
};

const ExtpipePage = () => {
  return <ExtpipePageComponent />;
};

export default ExtpipePage;
