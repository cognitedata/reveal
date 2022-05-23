import React from 'react';
import { Store } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';
import { AuthContainerMock } from './AuthContainerMock';
import '@cognite/cogs.js/dist/cogs.css';

type AppContainerProps = {
  sidecar?: unknown;
  store: Store;
  children: React.ReactNode;
};
export const AppContainer = ({ children, store }: AppContainerProps) => {
  return (
    <ReduxProvider store={store}>
      <AuthContainerMock>{children}</AuthContainerMock>
    </ReduxProvider>
  );
};
