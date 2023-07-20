import { Route, Routes } from 'react-router-dom';

import { ExtractorDetails } from './components/ExtractorDetails';
import { NewExtractor } from './components/NewExtractor';
import SourceSystemDetails from './components/source-system-details/SourceSystemDetails';
import ExtractorDownloads from './Home/Extractors';
import { GlobalStyles } from './styles/GlobalStyles';

const App = () => {
  return (
    <>
      <GlobalStyles>
        <Routes>
          <Route path="/new" element={<NewExtractor />} />
          <Route
            path="/extractor/:extractorExternalId"
            element={<ExtractorDetails />}
          />
          <Route
            path="/source-system/:sourceSystemExternalId"
            element={<SourceSystemDetails />}
          />
          <Route path="/" element={<ExtractorDownloads />} />
        </Routes>
      </GlobalStyles>
    </>
  );
};

export default App;
