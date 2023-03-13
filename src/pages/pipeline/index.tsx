import { Route, Routes } from 'react-router-dom';

import PipelineDetails from './details';

const Pipeline = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/:pipelineId*" element={<PipelineDetails />} />
    </Routes>
  );
};

export default Pipeline;
