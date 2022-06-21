import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { Container } from '@cognite/react-container';
import { AppRouter } from 'pages/routers/AppRouter';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <AppRouter />
    </>
  </Container>
);

export default App;
