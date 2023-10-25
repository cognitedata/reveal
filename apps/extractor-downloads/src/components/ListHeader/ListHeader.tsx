import { useParams } from 'react-router-dom';

import { Breadcrumb } from '@cognite/cdf-utilities';
import { Flex, Icon, Title } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { HeaderContainer } from '../HeaderContainer';
import { Layout } from '../Layout';

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
              <Title level={2} data-testid="extractor-download-page-title">
                {t('extract-data')}
              </Title>
            </Flex>
          </Flex>
        </Flex>
      </Layout.Container>
    </HeaderContainer>
  );
};

export default ListHeader;
