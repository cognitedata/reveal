import { Breadcrumb } from '@cognite/cdf-utilities';
import { Body, Flex, Title } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { HeaderContainer } from 'components/HeaderContainer';
import { Layout } from 'components/Layout';
import { useParams } from 'react-router-dom';

const NewExtractorHeader = () => {
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
              {
                path: `/${subAppPath}/new`,
                title: t('create-your-own-extractor'),
              },
            ]}
          />
          <Flex direction="column" gap={16}>
            <Title level="3">{t('create-your-own-extractor')}</Title>
            <Body level="1">
              {t('if-your-source-system-cant-use-any-of-the-extractors')}
            </Body>
          </Flex>
        </Flex>
      </Layout.Container>
    </HeaderContainer>
  );
};

export default NewExtractorHeader;
