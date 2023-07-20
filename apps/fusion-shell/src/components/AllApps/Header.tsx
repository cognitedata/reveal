import styled from 'styled-components';

import { Breadcrumb } from '@cognite/cdf-utilities';
import { Body, Colors, Flex, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../common/i18n';

import StyledLayout from './Layout';

const PageHeader = () => {
  const { t } = useTranslation();

  return (
    <StyledContainer>
      <StyledLayout>
        <Flex direction="column" gap={32}>
          <Breadcrumb
            items={[
              {
                path: `/apps`,
                title: t('title-all-features'),
              },
            ]}
          />
          <Flex gap={8} direction="column">
            <Title level={2}>{t('title-all-features')}</Title>
            <Body level={2}>{t('explore-all-features-in-cdf')}</Body>
          </Flex>
        </Flex>
      </StyledLayout>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 24px 0;
  background-color: ${Colors['surface--medium']};
`;

export default PageHeader;
