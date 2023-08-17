import '@cognite/cogs.js/dist/cogs.css';

import App from './app/App';
import { AuthProvider as InternalAuthProvider } from './app/common/auth/AuthProvider';
import GlobalStyles from './GlobalStyles';
import GlobalStyle from './utils/globalStyles';

export const AppWrapper = () => {
  return (
    <GlobalStyles>
      <InternalAuthProvider>
        <App />
      </InternalAuthProvider>
      <GlobalStyle />
    </GlobalStyles>
  );
};
