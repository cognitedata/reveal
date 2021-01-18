import React, { useState, useMemo } from 'react';
import { Button, A, Body, Graphic } from '@cognite/cogs.js';
import { useTranslation, Trans } from 'react-i18next';

import { Header } from './elements';
import { Container } from '../elements';

const Home = () => {
  const [crashing, setCrashing] = useState(false);

  const { t } = useTranslation(['Home', 'global']);

  const clickHandler = () => {
    setCrashing(true);
    if (!crashing) {
      throw new Error('Synthetic error');
    }
  };

  // Show how the 't' function can be used. Note that it is automatically bound
  // to the 'Home' namespace (unlike the Trans component).
  const buttonText = useMemo(() => {
    if (crashing) {
      return t('crashing_button', { defaultValue: 'Crashing &hellip;' });
    }
    return t('crashMe_button', { defaultValue: 'Crash me!' });
  }, [t, crashing]);

  return (
    <Container>
      <Header data-test-id="header">
        <Graphic type="Cognite" />
        <p>
          <Trans i18nKey="Home:welcome_paragraph" t={t}>
            Welcome to the Cognite React Demo App.
          </Trans>
        </p>
      </Header>
      <Body>
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
