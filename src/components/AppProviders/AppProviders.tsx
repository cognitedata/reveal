import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'store';
import { Provider as ReduxProvider } from 'react-redux';
import { PartialRootState } from 'store/types';

import { ToastContainer } from '@cognite/cogs.js';

type Props = {
  children: React.ReactNode;
  tenant: string;
  initialState?: PartialRootState;
};

const AppProviders = ({ tenant, children, initialState = {} }: Props) => {
  const store = configureStore(initialState);

  return (
    <ReduxProvider store={store}>
      <ToastContainer />
      <BrowserRouter basename={`/${tenant}`}>{children}</BrowserRouter>
    </ReduxProvider>
  );
};

export default AppProviders;
