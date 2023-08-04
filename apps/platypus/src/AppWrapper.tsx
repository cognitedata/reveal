import App from './app/App';
import store from './app/redux/store';
import { AppContainer } from './environments/AppContainer';

import './app/utils/sentry';

//
// Globally defined global
//
// GraphiQL package needs this to be run correctly
(window as any).global = window;

function AppWrapper() {
  return (
    <>
      <AppContainer store={store}>
        <App />
      </AppContainer>
    </>
  );
}

export default AppWrapper;
