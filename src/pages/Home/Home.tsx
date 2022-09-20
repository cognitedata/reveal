import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { useUserInformation } from 'hooks/useUserInformation';

const Home = () => {
  const { data, isLoading } = useUserInformation();
  const { displayName } = data ?? {};

  const { t } = useTranslation();

  return (
    <>
      <Container>
        <p>
          {isLoading ? (
            <Icon type="Loader" />
          ) : (
            t('welcome', {
              appName: 'Cognite Data Fusion',
              userName: displayName,
            })
          )}
        </p>
        <p data-testid="current-language">{t('current-language')}</p>
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
