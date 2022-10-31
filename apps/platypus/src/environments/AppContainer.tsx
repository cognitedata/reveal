import { Container } from '@cognite/react-container';
import { PlatypusSidecarConfig } from '@platypus-app/utils/sidecar';
import { Store } from 'redux';
import { AuthContainer } from './AuthContainer';

type AppContainerProps = {
  sidecar?: PlatypusSidecarConfig;
  store: Store;
  children: React.ReactNode;
};
export const AppContainer = ({
  children,
  store,
  sidecar,
}: AppContainerProps) => {
  return (
    <Container store={store} sidecar={sidecar as PlatypusSidecarConfig}>
      <div style={{ height: '100vh' }}>
        <AuthContainer>{children}</AuthContainer>
      </div>
    </Container>
  );
};
