import { Flex, Title } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import { ContentContainer } from 'components/ContentContainer';
import { DocsLinkGrid, DocsLinkGridItem } from 'components/DocsLinkGrid';
import { Layout } from 'components/Layout';
import { NewExtractorHeader } from 'components/NewExtractorHeader';

import pythonImgPath from 'assets/python.png';
import dotnetImgPath from 'assets/dotnet.png';

import {
  NET_EXTRACTOR_UTILS_SRC_CODE,
  NET_UTILS,
  PY_EXTRACTOR_EXAMPLE,
  PY_EXTRACTOR_UTILS_PKG,
  PY_EXTRACTOR_UTILS_SRC_CODE,
  PY_SDK,
} from './links';
import { trackUsage } from 'utils';

const NewExtractor = () => {
  const { t } = useTranslation();

  const trackEvent = (document: string, url: string) =>
    trackUsage({ e: 'Create.Extractor.Documentation.Click', document, url });

  return (
    <Layout>
      <NewExtractorHeader />
      <Layout.Container>
        <ContentContainer>
          <Flex gap={64} direction="column">
            <Flex gap={16} direction="column">
              <Flex gap={8}>
                {/* <Icon type="Python" /> */}
                <div>
                  <img src={pythonImgPath} alt="Python" />
                </div>
                <Title level="4">
                  {t('resources-for-custom-python-extractor')}
                </Title>
              </Flex>
              <DocsLinkGrid>
                <DocsLinkGridItem
                  href={PY_EXTRACTOR_UTILS_PKG}
                  onClick={() =>
                    trackEvent(
                      PY_EXTRACTOR_UTILS_PKG,
                      t('python-extractor-utils-package')
                    )
                  }
                >
                  {t('python-extractor-utils-package')}
                </DocsLinkGridItem>
                <DocsLinkGridItem
                  href={PY_SDK}
                  onClick={() => trackEvent(PY_SDK, t('python-sdk'))}
                >
                  {t('python-sdk')}
                </DocsLinkGridItem>
                <DocsLinkGridItem
                  href={PY_EXTRACTOR_UTILS_SRC_CODE}
                  onClick={() =>
                    trackEvent(
                      PY_EXTRACTOR_UTILS_SRC_CODE,
                      t('python-extractor-utils-source-code')
                    )
                  }
                >
                  {t('python-extractor-utils-source-code')}
                </DocsLinkGridItem>
                <DocsLinkGridItem
                  href={PY_EXTRACTOR_EXAMPLE}
                  onClick={() =>
                    trackEvent(
                      PY_EXTRACTOR_EXAMPLE,
                      t('python-extractor-example')
                    )
                  }
                >
                  {t('python-extractor-example')}
                </DocsLinkGridItem>
              </DocsLinkGrid>
            </Flex>
            <Flex gap={16} direction="column">
              <Flex gap={8}>
                {/* <Icon type=".NET" /> */}
                <div>
                  <img src={dotnetImgPath} alt=".NET" />
                </div>
                <Title level="4">
                  {t('resources-for-custom-net-extractor')}
                </Title>
              </Flex>
              <DocsLinkGrid>
                <DocsLinkGridItem
                  href={NET_UTILS}
                  onClick={() =>
                    trackEvent(NET_UTILS, t('net-utils-documentation'))
                  }
                >
                  {t('net-utils-documentation')}
                </DocsLinkGridItem>
                <DocsLinkGridItem
                  href={NET_EXTRACTOR_UTILS_SRC_CODE}
                  onClick={() =>
                    trackEvent(
                      NET_EXTRACTOR_UTILS_SRC_CODE,
                      t('net-extractor-utils-code')
                    )
                  }
                >
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
