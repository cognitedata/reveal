import { Provider as ReduxProvider } from 'react-redux';

import { store } from 'store';

import { AuthConsumer, Container } from '@cognite/react-container';
import type { AuthContext } from '@cognite/react-container';

import App from 'components/app/App';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import sidecar from 'utils/sidecar';

import Notifications from './Notifications';

export default function AppRoot() {
  return (
    <Container sidecar={sidecar}>
      <AuthConsumer>
        {({ client, authState }: AuthContext) =>
          client ? (
            <CdfClientProvider authState={authState} client={client}>
              <ReduxProvider store={store}>
                <App />
                <Notifications />
              </ReduxProvider>
            </CdfClientProvider>
          ) : null
        }
      </AuthConsumer>
    </Container>
  );
}
