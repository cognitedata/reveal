import React from 'react';
import TitleChanger from 'TitleChanger.tsx';
import TenantSelector from 'TenantSelector';
import { validateTenant } from 'utils';

const App = () => {
  return (
    <div className="App">
      <TitleChanger />
      <TenantSelector validateTenant={validateTenant} />
    </div>
  );
};

export default App;
