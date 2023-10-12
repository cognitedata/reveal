import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { parse } from 'query-string';

import { Icon } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  goToSelectProject,
  KeycloakResponse,
  saveSelectedIdpDetails,
  useKeycloakUserManager,
} from '@cognite/login-utils';

import SignInButton from '../../components/sign-in-button/SignInButton';

export default function SignInWithKeycloak({
  appConfiguration,
  authority,
  internalId,
  label,
  type,
  realm,
  cluster,
}: KeycloakResponse & { cluster: string }) {
  const navigate = useNavigate();
  const { internalId: activeInternalId } = getSelectedIdpDetails() ?? {};
  const active = activeInternalId === internalId;

  const { code } = parse(window.location.search);

  const userManager = useKeycloakUserManager({
    authority,
    client_id: appConfiguration.clientId,
    cluster,
    realm,
    audience: appConfiguration.audience || '',
  });

  const { data: user, isInitialLoading: isLoading } = useQuery(
    ['keycloak', 'user'],
    async () => {
      try {
        if (code) {
          const keycloakUser = userManager.signinRedirectCallback();
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return keycloakUser;
        } else {
          return userManager.getUser();
        }
      } finally {
        userManager.clearStaleState();
      }
    },
    { enabled: active }
  );

  useEffect(() => {
    if (user) {
      goToSelectProject(navigate);
    }
  }, [user, navigate]);

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  return (
    <SignInButton
      disabled={isLoading}
      isLoading={isLoading}
      onClick={() => {
        saveSelectedIdpDetails({
          internalId,
          type: type,
        });
        userManager.signinRedirect();
      }}
    >
      {label || 'Sign in with keycloak'}
    </SignInButton>
  );
}
