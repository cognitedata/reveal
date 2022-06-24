import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { ContainerWithoutI18N } from '@cognite/react-container';
import { AppRouter } from 'pages/routers/AppRouter';

const App = () => (
  <ContainerWithoutI18N sidecar={sidecar}>
    <>
      <GlobalStyles />
      <AppRouter />
    </>
  </ContainerWithoutI18N>
);

export default App;
