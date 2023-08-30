import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';

import {
  getSelectedIdpDetails,
  saveSelectedIdpDetails,
  useAuth0,
  Auth0Response,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';
import { Auth0 } from '../../components/icons';
import SignInButton from '../../components/sign-in-button/SignInButton';

const SignInWithAuth0 = ({
  appConfiguration,
  authority,
  internalId,
  label,
  type,
}: Auth0Response): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { internalId: activeInternalId } = getSelectedIdpDetails() ?? {};
  const auth0P = useAuth0(
    appConfiguration.clientId,
    authority,
    appConfiguration.audience
  );
  const { data: auth0, isInitialLoading: auth0Loading } = useQuery(
    [
      'auth0',
      'authority',
      appConfiguration.clientId,
      authority,
      appConfiguration.audience,
    ],
    async () => {
      return await auth0P;
    }
  );

  const { data: user, isLoading: userLoading } = useQuery(
    ['auth0', 'user', internalId, activeInternalId],
    async () => {
      if (auth0 && internalId === activeInternalId) {
        try {
          await auth0.handleRedirectCallback();
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } catch {
          // TODO: handle error
        }
        return auth0.getUser();
      }
    },
    {
      enabled: !!auth0,
      retry: false,
    }
  );

  useEffect(() => {
    if (user) {
      navigate('/select-project');
    }
  }, [user, navigate]);

  return (
    <SignInButton
      disabled={!auth0 || userLoading}
      isLoading={auth0Loading || userLoading}
      onClick={() => {
        saveSelectedIdpDetails({
          internalId,
          type: type,
        });
        auth0?.loginWithRedirect();
      }}
      icon={<Auth0 />}
    >
      {label || t('sign-in-with-auth0')}
    </SignInButton>
  );
};

export default SignInWithAuth0;
