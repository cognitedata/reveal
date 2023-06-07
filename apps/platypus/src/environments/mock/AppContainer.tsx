import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { Store } from 'redux';

import { AuthContainerMock } from './AuthContainerMock';
import '@cognite/cogs.js/dist/cogs.css';

type AppContainerProps = {
  store: Store;
  children: React.ReactNode;
};
export function AppContainer({ children, store }: AppContainerProps) {
  return (
    <ReduxProvider store={store}>
      <AuthContainerMock>{children}</AuthContainerMock>
    </ReduxProvider>
  );
}
