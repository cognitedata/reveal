import { Route, Routes } from 'react-router-dom';

import PipelineCreate from './create';

const Pipeline = (): JSX.Element => {
  return (
    <Routes>
      <Route path="/create*" element={<PipelineCreate />} />
    </Routes>
  );
};

export default Pipeline;
