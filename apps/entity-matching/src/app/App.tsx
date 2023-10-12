import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

import Details from './pages/Details';
import RootList from './pages/Home';
import Pipeline from './pages/pipeline';
import QuickMatch from './pages/quick-match';

const project = getProject();

const App = () => {
  const baseUrl = '/:projectName';

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
