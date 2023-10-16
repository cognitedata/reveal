import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { translations } from '@fusion/industry-canvas';
import { UserHistoryProvider } from '@user-history';
import collapseStyle from 'rc-collapse/assets/index.css';
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import {
  getCluster,
  getProject,
  useGlobalStyles,
} from '@cognite/cdf-utilities';
import { Loader, ToastContainer } from '@cognite/cogs.js';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import { ErrorBoundary } from '@cognite/react-errors';
import { FlagProvider } from '@cognite/react-feature-flags';

import { useUserInformation } from '../hooks/useUserInformation';
import styleScope from '../styleScope';

import RootApp from './RootApp';

const PROJECT_NAME = 'industrial-canvas';

export default () => {
  const { data: userInfo, isFetched } = useUserInformation();

  const project = getProject();
  const cluster = getCluster() ?? undefined;
  const userId = userInfo?.id;

  if (!project) {
    throw new Error('project missing');
  }

  const baseUrl = `/:tenant`;

  const didLoadStyles = useGlobalStyles([
    cogsStyles,
    collapseStyle,
    datePickerStyle,
  ]);

  if (!didLoadStyles || !isFetched) {
    return <Loader />;
  }

  return (
    <div className={styleScope.styleScope} style={{ height: '100%' }}>
      <UserHistoryProvider cluster={cluster} project={project} userId={userId}>
        <I18nWrapper
          translations={translations}
          defaultNamespace={PROJECT_NAME}
        >
          <ErrorBoundary>
            <FlagProvider
              apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
              appName="industry-canvas"
              projectName={project}
              remoteAddress={window.location.hostname}
              disableMetrics
              refreshInterval={86400}
            >
              <BrowserRouter>
                <Routes>
                  <Route path={`${baseUrl}/*`} element={<RootApp />} />
                </Routes>
              </BrowserRouter>
            </FlagProvider>
            <ToastContainer />
          </ErrorBoundary>
        </I18nWrapper>
      </UserHistoryProvider>
    </div>
  );
};
