import { Provider as ReduxProvider } from 'react-redux';

import App from '@simint-app/components/app/App';
import { store } from '@simint-app/store';

export default function AppRoot() {
  return (
    <ReduxProvider store={store}>
      <App />
    </ReduxProvider>
  );
}
