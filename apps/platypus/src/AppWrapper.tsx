import App from './app/App';
import store from './app/redux/store';
import sidecar from './app/utils/sidecar';
import { AppContainer } from './environments/AppContainer';

//
// Globally defined global
//
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
