import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@cognite/cogs.js';
import {
  getSelectedIdpDetails,
  removeSelectedIdpDetails,
  useAuth0,
  useIdp,
  Auth0Response,
} from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';

export default function Auth0LogoutButton() {
  const { internalId } = getSelectedIdpDetails() ?? {};
  const { data: idp } = useIdp<Auth0Response>(internalId);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const auth0P = useAuth0(
    idp?.appConfiguration.clientId,
    idp?.authority,
    idp?.appConfiguration.audience
  );

  const handleLogout = async () => {
    try {
      // Will not log out of IDP behind Auth0
      await (
        await auth0P
      )?.logout({
        returnTo: window.location.origin,
      });
    } catch {
      // TODO: handle error
    }
    removeSelectedIdpDetails();
    navigate('/');
  };

  return (
    <Button
      icon="Login"
      iconPlacement="right"
      onClick={handleLogout}
      type="ghost-accent"
    >
      {t('sign-in-other-account')}
    </Button>
  );
}
