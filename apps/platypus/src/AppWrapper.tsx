import sidecar from './app/utils/sidecar';
import store from './app/redux/store';
import { AppContainer } from './environments/AppContainer';
import App from './app/App';

//
// Globally defined global
// GraphiQL package needs this to be run correctly
(window as any).global = window;

function AppWrapper() {
  return (
    <>
      <AppContainer sidecar={sidecar} store={store}>
        <App />
      </AppContainer>
    </>
  );
}

export default AppWrapper;
