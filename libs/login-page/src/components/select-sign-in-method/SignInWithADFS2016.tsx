import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useQuery } from '@tanstack/react-query';

import {
  getSelectedIdpDetails,
  saveSelectedIdpDetails,
} from '@cognite/login-utils';
import { ADFS } from '@cognite/sdk-core';

import { useTranslation } from '../../common/i18n';
import { Microsoft } from '../../components/icons';
import SignInButton from '../../components/sign-in-button/SignInButton';

type SignInWithADFS2016Props = {
  authority: string;
  clientId: string;
  label?: string;
  cluster: string;
  internalId: string;
};

const SignInWithADFS2016 = ({
  authority,
  clientId,
  internalId,
  cluster,
  label,
}: SignInWithADFS2016Props): JSX.Element => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { internalId: activeInternalId } = getSelectedIdpDetails() ?? {};
  const active = activeInternalId === internalId;
  const adfs = useMemo(
    () =>
      new ADFS({
        authority: `${authority}/authorize`,
        requestParams: {
          clientId,
          resource: `https://${cluster}`,
        },
      }),
    [authority, clientId, cluster]
  );

  const {
    data: token,
    refetch,
    isFetched,
  } = useQuery(['adfs2016', authority, cluster], () => {
    return adfs.getCDFToken();
  });

  useEffect(() => {
    if (active) {
      const tokens = adfs.handleLoginRedirect();
      if (tokens) {
        refetch();
      }
    }
  }, [active, adfs, refetch]);

  useEffect(() => {
    if (token) {
      navigate('/select-project');
    }
  }, [token, navigate]);

  return (
    <SignInButton
      disabled={!isFetched}
      isLoading={!isFetched}
      onClick={() => {
        saveSelectedIdpDetails({
          internalId,
          type: 'ADFS2016',
        });
        adfs.login();
      }}
      icon={<Microsoft />}
    >
      {label || t('sign-in-with-adfs')}
    </SignInButton>
  );
};

export default SignInWithADFS2016;
