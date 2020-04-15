import React from 'react';

import TenantSelector from 'TenantSelector';
import { getSidecar } from 'utils';
import { Centered } from 'elements';
import background from 'assets/background.jpg';
import { StyledAuthenticationScreen } from './elements';

type Props = {
  handleSubmit: (tenant: string) => void;
  validateTenant: (tenant: string) => Promise<boolean>;
  loading: boolean;
  initialTenant?: string;
  error?: React.ReactNode;
};

const TenantSelectorScreen = (props: Props) => {
  const { backgroundImage } = getSidecar();
  return (
    <StyledAuthenticationScreen backgroundImage={backgroundImage || background}>
      <Centered>
        <TenantSelector {...props} />
      </Centered>
    </StyledAuthenticationScreen>
  );
};

export default TenantSelectorScreen;
