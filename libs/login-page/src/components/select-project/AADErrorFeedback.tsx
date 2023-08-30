import React from 'react';

import { IDPResponse, loginRedirectAad, usePca } from '@cognite/login-utils';

import { useTranslation } from '../../common/i18n';
import LoginInfoError from '../login-error-info/LoginInfoError';

type Props = {
  cluster: string;
  idp: IDPResponse;
  errorCode: string;
  errorMessage: string;
};

function InvalidGrantError({ idp, cluster }: Props) {
  const { t } = useTranslation();
  const pca = usePca(idp.appConfiguration.clientId, idp.authority);

  const errMsg = (
    <div>
      <p>{t('we-could-not-sign-you-in')}</p>
      <ol>
        <li>
          {t('no-access-step-1a')}{' '}
          <a
            target="_blank"
            href={`${idp.authority}/adminconsent?client_id=https://${cluster}`}
            rel="noreferrer"
          >
            {t('no-access-step-1b', { cluster })}
          </a>
        </li>

        <li>
          {t('no-access-step-2a', cluster)}{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const scopes = [
                `User.Read`,
                `https://${cluster}/IDENTITY`,
                `https://${cluster}/user_impersonation`,
              ];
              if (!pca) {
                throw new Error('PCA not initialized');
              }
              loginRedirectAad(pca, scopes, 'consent');
            }}
          >
            {t('no-access-step-2b')}
          </a>
        </li>
      </ol>
      <p>{t('no-access-step-3')}</p>
    </div>
  );

  return <LoginInfoError title={t('access-required')} message={errMsg} />;
}

function GenericError({ errorMessage }: Props) {
  const { t } = useTranslation();
  const err = <p>{errorMessage}</p>;
  return <LoginInfoError title={t('access-required')} message={err} />;
}

export default function AADErrorFeedback({
  idp,
  cluster,
  errorCode,
  errorMessage,
}: Props) {
  switch (errorCode) {
    case 'consent_required':
    case 'invalid_grant': {
      return (
        <InvalidGrantError
          idp={idp}
          cluster={cluster}
          errorCode={errorCode}
          errorMessage={errorMessage}
        />
      );
    }
    default: {
      return (
        <GenericError
          idp={idp}
          cluster={cluster}
          errorCode={errorCode}
          errorMessage={errorMessage}
        />
      );
    }
  }
}
