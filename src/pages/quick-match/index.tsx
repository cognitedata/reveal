import { Route, Routes } from 'react-router-dom';

import { QuickMatchContextProvider } from 'context/QuickMatchContext';

import QuickMatchCreate from './create';
import QuickMatchResults from './results';
import NoAccessPage from 'components/error-pages/NoAccess';
import UnknownErrorPage from 'components/error-pages/UnknownError';
import { useEMPipelines } from 'hooks/contextualization-api';

const QuickMatch = (): JSX.Element => {
  const { error } = useEMPipelines();

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

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
      <Route path="/results/:jobId" element={<QuickMatchResults />} />
    </Routes>
  );
};

export default QuickMatch;
