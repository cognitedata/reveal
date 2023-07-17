import './set-public-path';
import App from './app/App';
import GlobalStyles from './GlobalStyles';

export const AppWrapper = () => {
  return (
    <GlobalStyles>
      <App />
    </GlobalStyles>
  );
};
