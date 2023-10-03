import { Provider as ReduxProvider } from 'react-redux';

import { store } from '../../store';

import App from './App';

export default function AppRoot() {
  return (
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  );
}
