import React, { useState, useMemo } from 'react';
import { Button, A, Body } from '@cognite/cogs.js';
import { useTranslation, Trans } from 'react-i18next';
import sidecar from 'utils/sidecar';

import { Container, Header } from './elements';

const Home = () => {
  const [crashing, setCrashing] = useState(false);

  const { t } = useTranslation('Home');

  const clickHandler = () => {
    setCrashing(true);
    if (!crashing) {
      throw new Error('Synthetic error');
    }
  };

  // Show how the t function can be used. Note that it is automatically bound
  // to the 'Home' namespace (unlike the Trans component).
  const buttonText = useMemo(() => {
    if (crashing) {
      return t('crashing_button', { defaultValue: 'Crashing ...' });
    }
    return t('crashMe_button', { defaultValue: 'Crash me!' });
  }, [t, crashing]);

  return (
    <Container>
      <Header>
        <p>
          <Trans i18nKey="Home:versionInfo_paragraph" t={t}>
            This is v
            {{ versionName: process.env.REACT_APP_VERSION_NAME || '0.0.0' }}
          </Trans>
        </p>
        <A
          isExternal
          href="https://cog.link/fas"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans i18nKey="Home:learnMore_link" t={t}>
            Learn about how this is hosted
          </Trans>
        </A>
      </Header>
      <Body>
        <Trans t={t} i18nKey="cdfBaseUrl_paragraph">
          The CDF base URL for this cluster is{' '}
          <code>{{ baseURL: sidecar.cdfApiBaseUrl }}</code>
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
      <Button
        disabled={crashing}
        type="danger"
        onClick={clickHandler}
        style={{ marginTop: 8 }}
      >
        {buttonText}
      </Button>
    </Container>
  );
};

export default Home;
