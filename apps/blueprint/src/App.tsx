import GlobalStyles from 'global-styles';
import { Container } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import { ProvideMixpanel } from 'components/ProvideMixpanel';
import { AuthProvider } from 'providers/AuthProvider';
import Routes from 'pages/Routes';
import { ToastContainer } from '@cognite/cogs.js';

const App = () => (
  <Container sidecar={sidecar as any}>
    <AuthProvider>
      <GlobalStyles />
      <ProvideMixpanel />
      <ToastContainer />
      <Routes />
    </AuthProvider>
  </Container>
);

export default App;
