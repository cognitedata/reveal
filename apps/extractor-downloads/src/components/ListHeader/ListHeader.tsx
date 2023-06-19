import { Flex, Icon, Title } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';

import { useTranslation } from 'common';
import { Layout } from 'components/Layout';
import { Breadcrumb } from '@cognite/cdf-utilities';
import { HeaderContainer } from 'components/HeaderContainer';

const ListHeader = () => {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{ subAppPath?: string }>();
  return (
    <HeaderContainer>
      <Layout.Container>
        <Flex direction="column" gap={32}>
          <Breadcrumb
            items={[
              {
                path: `/${subAppPath}`,
                title: t('extract-data'),
              },
            ]}
          />
          <Flex direction="column" gap={24}>
            <Flex gap={18} alignItems="center">
              <Icon type="Export" size={28} />
              <Title level={2}>{t('extract-data')}</Title>
            </Flex>
          </Flex>
        </Flex>
      </Layout.Container>
    </HeaderContainer>
  );
};

export default ListHeader;
