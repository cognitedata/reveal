import styled from 'styled-components';
import { Colors, Flex, Icon, Input, Title } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { Layout } from 'components/Layout';
import { Breadcrumb } from '@cognite/cdf-utilities';

const Header = () => {
  const { t } = useTranslation();
  return (
    <StyledContainer>
      <Layout.Container>
        <Flex direction="column" gap={32}>
          <Breadcrumb
            items={[
              {
                path: '/extractors',
                title: t('extract-data'),
              },
            ]}
          />
          <Flex direction="column" gap={24}>
            <Flex gap={18} alignItems="center">
              <Icon type="Export" size={28} />
              <Title level={2}>{t('extract-data')}</Title>
            </Flex>
            <StyledSearchInput
              size="large"
              fullWidth
              placeholder={t('search-for-source-systems')}
            />
          </Flex>
        </Flex>
      </Layout.Container>
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  padding: 24px 0;
  background-color: ${Colors['greyscale-grey1']};
`;

const StyledSearchInput = styled(Input).attrs({
  type: 'search',
  icon: 'Search',
})`
  svg {
    color: ${Colors['text-icon--muted']};

    path {
      fill: currentColor;
    }
  }
`;

export default Header;
