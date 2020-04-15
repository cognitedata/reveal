import React from 'react';
import TitleChanger from 'TitleChanger.tsx';
import TenantSelectorContainer from 'TenantSelectorContainer';
import { getSidecar } from 'utils';

const App = () => {
  const { applicationId } = getSidecar();

  return (
    <div className="App">
      <TitleChanger />
      <TenantSelectorContainer applicationId={applicationId} />
    </div>
  );
};

export default App;
