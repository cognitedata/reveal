/* eslint-disable @cognite/no-number-z-index */
import { lazy, Suspense, useEffect } from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';

import { createLink } from '@cognite/cdf-utilities';
import { Loader } from '@cognite/cogs.js';

import AccessCheck from './AccessCheck';
import { DataSetsContextProvider } from './context';
import GlobalStyles from './styles/GlobalStyles';
import { trackUsage } from './utils';

const DataSetsList = lazy(() => import('./pages/DataSetsList/DataSetsList'));
const DataSetDetails = lazy(
  () => import('./pages/DataSetDetails/DataSetDetails')
);

const App = () => {
  useEffect(() => {
    trackUsage({ e: 'data.sets.navigate' });
  }, []);

  return (
    <GlobalStyles>
      <DataSetsContextProvider>
        <Suspense fallback={<Loader />}>
          <AccessCheck>
            <Routes>
              <Route path="/" element={<DataSetsList />} />
              <Route path="/data-set/:dataSetId" element={<DataSetDetails />} />
              {/* We used to use the /data-sets route, now we're redirecting */}
              {/* to /data-catalog instead, this basically sets up a redirect. */}
              <Route
                path="/data-sets"
                element={<Navigate replace to={createLink('/data-catalog')} />}
              />
            </Routes>
          </AccessCheck>
        </Suspense>
      </DataSetsContextProvider>
    </GlobalStyles>
  );
};

export default App;
