import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  usePca,
  getSelectedIdpDetails,
  saveSelectedIdpDetails,
  AADB2CResponse,
  loginRedirectAad,
  goToSelectProject,
} from '@cognite/login-utils';

import { Microsoft } from '../../components/icons';
import SignInButton from '../../components/sign-in-button/SignInButton';
import { useLoginPageContext } from '../../contexts/LoginPageContext';

const SignInWithAADB2C = ({
  appConfiguration,
  authority,
  internalId,
  label,
  policy,
  type,
}: AADB2CResponse): JSX.Element => {
  const { isHandledAADRedirect, setIsHandledAADRedirect } =
    useLoginPageContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const knownAuth = [new URL(`${authority}/${policy}`).hostname];
  const pca = usePca(
    appConfiguration.clientId,
    `${authority}/${policy}`,
    knownAuth
  );

  const { internalId: selectedInternalId } = getSelectedIdpDetails() ?? {};
  const shouldHandleRedirect = internalId === selectedInternalId;

  useEffect(() => {
    // If there is an entry for selected idp, this means user has already
    // started an authentication flow. It could be succeeded, it could be
    // failed or user might have aborted the authentication flow in the middle.
    // Here, we handle these three cases for client ids added to current
    // domain configuration.
    if (shouldHandleRedirect) {
      pca
        ?.handleRedirectPromise()
        .then((redirectResult) => {
          if (redirectResult?.account) {
            pca.setActiveAccount(redirectResult?.account);
            goToSelectProject(navigate);
          }
        })
        // eslint-disable-next-line lodash/prefer-noop
        .catch(() => {
          // TODO: handle error case with `error.errorCode`
        })
        .finally(() => {
          setIsHandledAADRedirect(true);
        });
    }
  }, [navigate, pca, setIsHandledAADRedirect, shouldHandleRedirect]);

  useEffect(() => {
    // If there is an active AAD account entry in local storage for the
    // selected login flow, we navigate to the project select step.
    const { internalId: selectedIdpId } = getSelectedIdpDetails() ?? {};
    if (selectedIdpId === internalId) {
      goToSelectProject(navigate);
    }
  }, [authority, navigate, internalId, pca]);

  const handleSignInWithAAD = () => {
    // In some cases, we still have `msal.interaction.status` entry on
    // session storage while trying to sign in. And it returns an error if we
    // call `loginRedirect` without calling `handleRedirectPromise`. We don't
    // care about redirect promise result because it should be handled in some
    // other place. We only want to clear everything related to msal state.
    pca?.handleRedirectPromise().then(() => {
      // Resetting the active aad account if there is any
      pca?.setActiveAccount(null);

      // Saving selected login flow id to local storage so that sdk singleton can
      // use it for authentication.
      saveSelectedIdpDetails({ internalId, type });

      // Redirecting to microsoft login page
      loginRedirectAad(pca, [], 'select_account');
    });
  };

  return (
    <SignInButton
      isLoading={!isHandledAADRedirect}
      onClick={handleSignInWithAAD}
      icon={<Microsoft />}
    >
      {label || t('sign-in-with-microsoft-b2c')}
    </SignInButton>
  );
};

export default SignInWithAADB2C;
