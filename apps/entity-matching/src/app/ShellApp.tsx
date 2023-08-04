import { Route, Routes } from 'react-router-dom';

import Details from '@entity-matching-app/pages/Details';
import RootList from '@entity-matching-app/pages/Home';
import Pipeline from '@entity-matching-app/pages/pipeline';
import QuickMatch from '@entity-matching-app/pages/quick-match';
import GlobalStyles from '@entity-matching-app/styles/GlobalStyles';

const App = () => {
  return (
    <GlobalStyles>
      <Routes>
        <Route path="/" element={<RootList />} />
        <Route path="/quick-match*" element={<QuickMatch />} />
        <Route path="/pipeline/:pipelineId*" element={<Pipeline />} />
        <Route path="/:id" element={<Details />} />
      </Routes>
    </GlobalStyles>
  );
};

export default App;
