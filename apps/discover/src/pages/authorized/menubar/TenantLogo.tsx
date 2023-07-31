import React, { useEffect } from 'react';

import logoBpImage from 'images/logo/owa-prod.png';
import styled from 'styled-components/macro';

import { getTenantInfo } from '@cognite/react-container';

import { Center, sizes } from 'styles/layout';

const Image = styled.img`
  transform: scale(0.7, 0.7);
  margin-right: ${sizes.small}; ;
`;
const LogoWrapper = styled.div`
  margin-left: ${sizes.small};
  margin-right: ${sizes.small};
`;

export const TenantLogo: React.FC = () => {
  const [tenant] = getTenantInfo();
  const [logo, setLogo] = React.useState<string>();

  // @todo(PP-2966) - make this dynamic again
  const bp = ['owa-prod'];
  useEffect(() => {
    if (bp.includes(tenant)) {
      setLogo(logoBpImage);
    }
  }, [tenant]);

  if (!logo) {
    return null;
  }

  return (
    <LogoWrapper>
      <Center>
        <Image src={logo} alt={`${tenant} logo`} id="tenant-logo-icon" />
      </Center>
    </LogoWrapper>
  );
};
