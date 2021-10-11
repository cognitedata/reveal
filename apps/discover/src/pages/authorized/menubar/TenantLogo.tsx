import React from 'react';
import { NavLink } from 'react-router-dom';

import noop from 'lodash/noop';
import styled from 'styled-components/macro';

import { getTenantInfo } from '@cognite/react-container';

import { Center, sizes } from 'styles/layout';

const Image = styled.img`
  transform: scale(0.7, 0.7);
  margin-right: ${sizes.small}; ;
`;

export const TenantLogo: React.FC = () => {
  const [tenant] = getTenantInfo();
  const [logo, setLogo] = React.useState();

  React.useEffect(() => {
    import(`images/logo/${tenant}.png`)
      .then(({ default: importedLogo }) => {
        if (importedLogo) {
          setLogo(importedLogo);
        }
      })
      .catch(() => {
        // no problem!
        return noop;
      });
  }, [tenant]);

  if (!logo) {
    return null;
  }

  return (
    <Center>
      <NavLink to="/">
        <Image src={logo} alt={`${tenant} logo`} id="tenant-logo-icon" />
      </NavLink>
    </Center>
  );
};
