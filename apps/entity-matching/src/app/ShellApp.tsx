import { Route, Routes } from 'react-router-dom';

import Details from './pages/Details';
import RootList from './pages/Home';
import Pipeline from './pages/pipeline';
import QuickMatch from './pages/quick-match';
import GlobalStyles from './styles';

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
