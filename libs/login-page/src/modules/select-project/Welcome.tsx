import React, { useMemo } from 'react';

import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';

import { Avatar } from '@cognite/cogs.js';
import {
  useAuth0UserName,
  usePca,
  IDPResponse,
  AADResponse,
  Auth0Response,
  AADB2CResponse,
  KeycloakResponse,
  useKeycloakUserManager,
} from '@cognite/login-utils';

type WelcomeProps = {
  idp?: IDPResponse;
};

function AADWelcome({ idp }: { idp: AADResponse }) {
  const pca = usePca(idp?.appConfiguration.clientId, idp?.authority);
  const activeAccount = useMemo(() => {
    return pca?.getActiveAccount();
  }, [pca]);

  return <StyledAvatar text={activeAccount?.name || ''} />;
}

function AADB2CWelcome({ idp }: { idp: AADB2CResponse }) {
  const knownAuth = [new URL(`${idp.authority}/${idp.policy}`).hostname];
  const pca = usePca(idp?.appConfiguration.clientId, idp?.authority, knownAuth);
  const activeAccount = useMemo(() => {
    return pca?.getActiveAccount();
  }, [pca]);
  return <StyledAvatar text={activeAccount?.name || ''} />;
}

function Auth0Welcome({ idp }: { idp: Auth0Response }) {
  const { data: name } = useAuth0UserName(idp);

  return <StyledAvatar text={name || ''} />;
}

function KeycloakWelcome({ idp }: { idp: KeycloakResponse }) {
  const userManager = useKeycloakUserManager({
    authority: idp.authority,
    client_id: idp.appConfiguration.clientId,
    cluster: idp.clusters[0],
    realm: idp.realm,
    audience: idp.appConfiguration.audience || '',
  });

  const { data: user } = useQuery(
    [
      'keycloak',
      'user-info',
      idp.authority,
      idp.realm,
      idp.appConfiguration.clientId,
    ],
    () => userManager.getUser()
  );
  return <StyledAvatar text={user?.profile.name || ''} />;
}

export default function Welcome({ idp }: WelcomeProps) {
  switch (idp?.type) {
    case 'AZURE_AD': {
      return <AADWelcome idp={idp} />;
    }
    case 'AAD_B2C': {
      return <AADB2CWelcome idp={idp as AADB2CResponse} />;
    }
    case 'AUTH0': {
      return <Auth0Welcome idp={idp} />;
    }
    case 'KEYCLOAK': {
      return <KeycloakWelcome idp={idp as KeycloakResponse} />;
    }
    default: {
      return <></>;
    }
  }
}

const StyledAvatar = styled(Avatar)`
  margin-bottom: 8px;
`;
