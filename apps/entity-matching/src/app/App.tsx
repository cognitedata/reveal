import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Details from '@entity-matching-app/pages/Details';
import RootList from '@entity-matching-app/pages/Home';
import Pipeline from '@entity-matching-app/pages/pipeline';
import QuickMatch from '@entity-matching-app/pages/quick-match';

import { getProject, isUsingUnifiedSignin } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

const project = getProject();

const App = () => {
  const baseUrl = isUsingUnifiedSignin()
    ? `/cdf/:projectName`
    : '/:projectName';

  return (
    <FlagProvider
      appName="cdf-ui-entity-matching"
      apiToken="v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE"
      projectName={project}
    >
      <BrowserRouter>
        <Routes>
          <Route path={`${baseUrl}/:subAppPath`} element={<RootList />} />
          <Route
            path={`${baseUrl}/:subAppPath/quick-match*`}
            element={<QuickMatch />}
          />
          <Route
            path={`${baseUrl}/:subAppPath/pipeline/:pipelineId*`}
            element={<Pipeline />}
          />
          <Route path={`${baseUrl}/:subAppPath/:id`} element={<Details />} />
        </Routes>
      </BrowserRouter>
    </FlagProvider>
  );
};

export default App;
