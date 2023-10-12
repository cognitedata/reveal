import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { translations } from '@transformations/common/i18n';
import TransformationDetails from '@transformations/pages/transformation-details/TransformationDetails';
import TransformationList from '@transformations/pages/transformation-list/TransformationList';
import GlobalStyles from '@transformations/styles/GlobalStyles';
import { UserHistoryProvider } from '@user-history';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer, getCluster, getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

import { useUserInformation } from './hooks';

const App = () => {
  const project = getProject();
  const cluster = getCluster() ?? undefined;
  const { data: user } = useUserInformation();
  const userId = user?.id;

  return (
    <I18nWrapper translations={translations} defaultNamespace="transformations">
      <FlagProvider
        apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
        appName="transformations"
        projectName={project}
      >
        <GlobalStyles>
          <AuthContainer
            title="Transform Data"
            sdk={sdk}
            login={loginAndAuthIfNeeded}
          >
            <UserHistoryProvider
              cluster={cluster}
              project={project}
              userId={userId}
            >
              <Router>
                <Routes>
                  <Route
                    path={`${project}/:subAppPath/:transformationId`}
                    element={<TransformationDetails />}
                  />

                  <Route
                    path={`${project}/:subAppPath`}
                    element={<TransformationList />}
                  />
                </Routes>
              </Router>
            </UserHistoryProvider>
          </AuthContainer>
        </GlobalStyles>
        <ReactQueryDevtools initialIsOpen={false} />
      </FlagProvider>
    </I18nWrapper>
  );
};
export default App;
