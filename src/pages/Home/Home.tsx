import React from 'react';

import { Button, Flex, Icon } from '@cognite/cogs.js';
import { selectLanguage } from '@cognite/cdf-utilities';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useUserInformation } from 'hooks/useUserInformation';
import { trackUsage } from 'utils';

const Home = () => {
  const { data, isLoading } = useUserInformation();
  const { displayName, email } = data ?? {};

  const { t } = useTranslation();

  return (
    <>
      <Container>
        <p>
          {isLoading ? (
            <Icon type="Loader" />
          ) : (
            t('welcome_text', ['Cognite Data Fusion', displayName])
          )}
        </p>
        <p data-testid="current-language">{t('current_language_text')}</p>
        <Flex gap={12}>
          <Button
            type="primary"
            onClick={() => {
              trackUsage('clicked-button', email);
              selectLanguage('en');
            }}
            disabled={isLoading}
          >
            {t('english_language')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              trackUsage('clicked-button', email);
              selectLanguage('no');
            }}
            disabled={isLoading}
          >
            {t('norwegian_language')}
          </Button>
        </Flex>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default Home;
