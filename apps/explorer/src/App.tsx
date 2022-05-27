import GlobalStyles from 'global-styles';
import sidecar from 'utils/sidecar';
import { Container } from '@cognite/react-container';
import { AppRouter } from 'pages/routers/AppRouter';

import { ApolloProviderWrapper } from './providers/ApolloProviderWrapper';

const App = () => (
  <Container sidecar={sidecar}>
    <ApolloProviderWrapper>
      <GlobalStyles />
      <AppRouter />
    </ApolloProviderWrapper>
  </Container>
);

export default App;
