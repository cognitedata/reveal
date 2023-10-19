import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import noop from 'lodash/noop';
import { parse } from 'query-string';

import { Icon, PromoChip } from '@cognite/cogs.js';
import {
  cogIdpAuthority,
  cogIdpInternalId,
  cogniteIdPSignInRedirect,
  getCogIdPState,
  getSelectedIdpDetails,
  goToSelectProject,
  saveSelectedIdpDetails,
  useCogniteIdPUserManager,
} from '@cognite/login-utils';

import { Microsoft } from '../../components/icons';
import SignInButton from '../../components/sign-in-button/SignInButton';

export default function SignInWithCogniteIdP({
  organization,
  clientId,
  autoInitiate,
}: {
  organization: string;
  clientId: string;
  autoInitiate: boolean;
}) {
  const navigate = useNavigate();

  const { internalId: activeInternalId } = getSelectedIdpDetails() ?? {};
  const active = activeInternalId === cogIdpInternalId;

  const { code } = parse(window.location.search);

  const userManager = useCogniteIdPUserManager({
    authority: cogIdpAuthority,
    client_id: clientId,
  });

  const { data: user, isInitialLoading: isLoading } = useQuery(
    ['cognite_idp', 'user'],
    async () => {
      try {
        if (code) {
          const cdfUser = await userManager.signinRedirectCallback();
          const { location } = window;
          const { pathname, search } = getCogIdPState(cdfUser);
          window.location.replace(
            (pathname || location.pathname) + (search || '')
          );
          return new Promise(noop);
        } else {
          return userManager.getUser();
        }
      } finally {
        await userManager.clearStaleState();
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

  const initiateSignIn = async () => {
    saveSelectedIdpDetails({
      internalId: cogIdpInternalId,
      type: 'COGNITE_IDP',
    });
    await cogniteIdPSignInRedirect(userManager, organization);
  };

  // If we have a code or user it means we're in the IdP sign-in callback
  const shouldAutoInitiate = autoInitiate && !code && !user;
  if (shouldAutoInitiate) {
    initiateSignIn();
  }

  return (
    <SignInButton
      disabled={isLoading || shouldAutoInitiate}
      isLoading={isLoading || shouldAutoInitiate}
      onClick={initiateSignIn}
      icon={<Microsoft />}
    >
      Sign in with Microsoft
      <PromoChip
        type="solid"
        size="x-small"
        tooltip={false}
        style={{ marginLeft: '10px' }}
      >
        Experimental
      </PromoChip>
    </SignInButton>
  );
}
