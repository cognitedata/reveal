import React, { useState, useMemo } from 'react';
import { Button } from '@cognite/cogs.js';
import { Trans, useTranslation } from 'react-i18next';
import { Container, Header, ExternalLink, Logo } from './elements';
import logo from './logo.svg';

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
        <Logo src={logo} />
        <p>
          <Trans i18nKey="Home:versionInfo_paragraph">
            This is v
            {{ versionName: process.env.REACT_APP_VERSION_NAME || '0.0.0' }}
          </Trans>
        </p>
        <ExternalLink
          href="https://cog.link/fas"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Trans i18nKey="Home:learnMore_link">
            Learn about how this is hosted
          </Trans>
        </ExternalLink>
        <Button
          disabled={crashing}
          type="danger"
          onClick={clickHandler}
          style={{ marginTop: 8 }}
        >
          {buttonText}
        </Button>
      </Header>
    </Container>
  );
};

export default Home;
