import { Provider as ReduxProvider } from 'react-redux';

import { store } from 'store';

import { Container } from '@cognite/react-container';

import App from 'components/app/App';
import sidecar from 'utils/sidecar';

export default function AppRoot() {
  return (
    <Container sidecar={sidecar}>
      <ReduxProvider store={store}>
        <App />
      </ReduxProvider>
    </Container>
  );
}
