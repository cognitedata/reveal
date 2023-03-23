import { Route, Routes } from 'react-router-dom';

import { QuickMatchContextProvider } from 'context/QuickMatchContext';

import QuickMatchCreate from './create';
import QuickMatchResults from './results';

const QuickMatch = (): JSX.Element => {
  return (
    <Routes>
      <Route
        path="/create*"
        element={
          <QuickMatchContextProvider>
            <QuickMatchCreate />
          </QuickMatchContextProvider>
        }
      />
      <Route
        path="/results/:jobId/:sourceType"
        element={<QuickMatchResults />}
      />
    </Routes>
  );
};

export default QuickMatch;
