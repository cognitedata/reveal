import { Flex, Title } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { ContentContainer } from 'components/ContentContainer';
import { DocsLinkGrid, DocsLinkGridItem } from 'components/DocsLinkGrid';
import { Layout } from 'components/Layout';
import { NewExtractorHeader } from 'components/NewExtractorHeader';

const NewExtractor = () => {
  const { t } = useTranslation();
  return (
    <Layout>
      <NewExtractorHeader />
      <Layout.Container>
        <ContentContainer>
          <Flex gap={64} direction="column">
            <Flex gap={16} direction="column">
              <Flex gap={8}>
                {/* <Icon type="Python" /> */}
                <Title level="4">
                  {t('resources-for-custom-python-extractor')}
                </Title>
              </Flex>
              <DocsLinkGrid>
                <DocsLinkGridItem href="https://cognite-extractor-utils.readthedocs-hosted.com/en/latest/">
                  {t('python-extractor-utils-package')}
                </DocsLinkGridItem>
                <DocsLinkGridItem href="https://docs.cognite.com/dev/guides/sdk/python/">
                  {t('python-sdk')}
                </DocsLinkGridItem>
                <DocsLinkGridItem href="https://github.com/cognitedata/python-extractor-utils">
                  {t('python-extractor-utils-source-code')}
                </DocsLinkGridItem>
                <DocsLinkGridItem href="https://github.com/cognitedata/python-extractor-example">
                  {t('python-extractor-example')}
                </DocsLinkGridItem>
              </DocsLinkGrid>
            </Flex>
            <Flex gap={16} direction="column">
              <Flex gap={8}>
                {/* <Icon type=".NET" /> */}
                <Title level="4">
                  {t('resources-for-custom-net-extractor')}
                </Title>
              </Flex>
              <DocsLinkGrid>
                <DocsLinkGridItem href="https://cognitedata.github.io/dotnet-extractor-utils/tutorials/intro.html">
                  {t('net-utils-documentation')}
                </DocsLinkGridItem>
                <DocsLinkGridItem href="https://github.com/cognitedata/dotnet-extractor-utils">
                  {t('net-extractor-utils-code')}
                </DocsLinkGridItem>
              </DocsLinkGrid>
            </Flex>
          </Flex>
        </ContentContainer>
      </Layout.Container>
    </Layout>
  );
};

export default NewExtractor;
