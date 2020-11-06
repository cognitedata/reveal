import React from 'react';
import { A, Body } from '@cognite/cogs.js';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

import sidecar from 'utils/sidecar';
import { Container } from '../elements';

const Info = () => {
  const { t } = useTranslation('Info');

  const baseURL = sidecar.cdfApiBaseUrl;

  return (
    <Container>
      <Body>
        <Trans t={t} i18nKey="cdfBaseUrl_paragraph">
          The CDF base URL for this cluster is <code>{baseURL}</code>
        </Trans>
      </Body>
      <Body>
        <Trans t={t} i18nKey="info-sidecar">
          Learn more about{' '}
          <A
            isExternal
            href="https://cog.link/sidecar"
            target="_blank"
            rel="noopener noreferrer"
          >
            sidecars
          </A>
          !
        </Trans>
      </Body>

      <Body>
        <Link to="/home">Take me back home</Link>
      </Body>
    </Container>
  );
};

export default Info;
