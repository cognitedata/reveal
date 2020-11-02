import React from 'react';
import { Store } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

interface ConditionalReduxProviderProps {
  store?: Store;
  children: JSX.Element;
}
export const ConditionalReduxProvider = ({
  children,
  store,
}: ConditionalReduxProviderProps) => {
  if (store) {
    return <ReduxProvider store={store}>{children}</ReduxProvider>;
  }

  return <>{children}</>;
};
