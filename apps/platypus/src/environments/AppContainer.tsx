import { Container } from '@cognite/react-container';
import { Store } from 'redux';
import { AuthContainer } from './AuthContainer';
import { SidecarConfig } from '@cognite/sidecar';

export interface PlatypusSidecarConfig extends SidecarConfig {
  disableTranslations?: boolean;
  disableLoopDetector?: boolean;
  disableSentry?: boolean;
  disableIntercom?: boolean;
  disableReactQuery?: boolean;
}

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
