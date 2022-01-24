import { Store } from 'redux';
import { Provider as ReduxProvider } from 'react-redux';

interface ConditionalReduxProviderProps {
  sidecar?: unknown;
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
