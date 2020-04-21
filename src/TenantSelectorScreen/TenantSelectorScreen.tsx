import React from 'react';

import TenantSelector from 'TenantSelector';
import { getSidecar } from 'utils';
import { Centered } from 'styles/elements';
import background from 'assets/background.jpg';
import TenantSelectorBackground from 'TenantSelectorBackground/TenantSelectorBackground';
import { StyledTenantSelectorScreen } from './elements';

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
    <TenantSelectorBackground backgroundImage={backgroundImage || background}>
      <StyledTenantSelectorScreen>
        <Centered>
          <TenantSelector {...props} />
        </Centered>
      </StyledTenantSelectorScreen>
    </TenantSelectorBackground>
  );
};

export default TenantSelectorScreen;
