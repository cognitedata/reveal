import { Container, AuthConsumer, AuthContext } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from 'store';
import { CdfClientProvider } from 'providers/CdfClientProvider';
import App from 'components/app/App';
import { ApiProvider } from 'providers/ApiProvider';

export default function AppRoot() {
  return (
    <Container sidecar={sidecar}>
      <AuthConsumer>
        {({ client, authState }: AuthContext) =>
          client ? (
            <CdfClientProvider client={client} authState={authState}>
              <ApiProvider authState={authState}>
                <ReduxProvider store={store}>
                  <App />
                </ReduxProvider>
              </ApiProvider>
            </CdfClientProvider>
          ) : null
        }
      </AuthConsumer>
    </Container>
  );
}
