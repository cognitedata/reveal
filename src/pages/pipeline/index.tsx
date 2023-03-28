import { Route, Routes } from 'react-router-dom';

import PipelineDetails from './details';
import PipelineResults from './results';

const Pipeline = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/details*" element={<PipelineDetails />} />
      <Route path="/results/:jobId" element={<PipelineResults />} />
    </Routes>
  );
};

export default Pipeline;
