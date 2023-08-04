import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  Button,
  Chip,
  Flex,
  Icon,
  formatDate,
  Heading,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { ExtractorWithReleases } from '../../service/extractors';
import { trackUsage } from '../../utils';
import { ContentContainer } from '../ContentContainer';
import { CreateConnectionModal } from '../create-connection-modal/CreateConnectionModal';
import { DetailsHeader } from '../DetailsHeader';
import { DocsLinkGrid, DocsLinkGridItem } from '../DocsLinkGrid';
import {
  StyledDivider,
  StyledLayoutGrid,
  StyledLink,
  StyledTagsContainer,
} from '../ExtractorDetails/ExtractorDetails';
import { Layout } from '../Layout';
import Markdown from '../markdown';

type HostedExtractorDetailsProps = {
  extractor: ExtractorWithReleases;
};

export const HostedExtractorDetails = ({
  extractor,
}: HostedExtractorDetailsProps): JSX.Element => {
  const { t } = useTranslation();
  const { search } = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const latestRelease = extractor?.releases?.at(0);
  const createdAt =
    latestRelease?.createdTime && formatDate(latestRelease?.createdTime);

  const tags = extractor?.tags ?? [];

  const externalLinks =
    extractor?.links?.filter(
      (link) => link?.type === 'externalDocumentation'
    ) ?? [];

  const genericLinks =
    extractor?.links?.filter((link) => link?.type === 'generic') ?? [];

  if (!extractor) {
    // TODO: add not found page
    return <>not found</>;
  }

  return (
    <Layout>
      <DetailsHeader
        imageUrl={extractor?.imageUrl}
        title={String(extractor?.name)}
        version={latestRelease?.version || ''}
        createdAt={createdAt || ''}
      />
      <ContentContainer>
        <Layout.Container>
          <StyledLayoutGrid>
            <Flex direction="column" gap={32}>
              <Markdown
                content={extractor?.documentation || extractor?.description}
              />
              {externalLinks?.length > 0 && (
                <Flex direction="column" gap={16}>
                  <Heading level={5}>
                    {t('user-guide-from-cognite-docs')}
                  </Heading>
                  <DocsLinkGrid>
                    {externalLinks?.map((link) => (
                      <DocsLinkGridItem
                        key={link?.name}
                        href={link?.url}
                        onClick={() => {
                          trackUsage({
                            e: 'Documentation.Click',
                            name: extractor?.name,
                            document: link?.name,
                            url: link?.url,
                          });
                        }}
                      >
                        {link?.name}
                      </DocsLinkGridItem>
                    ))}
                  </DocsLinkGrid>
                </Flex>
              )}
            </Flex>
            <aside>
              <Flex direction="column" gap={24}>
                <Flex direction="column" gap={16}>
                  <Heading level={5}>{t('set-up-hosted-extractor')}</Heading>
                  <Link to={`create_new_connection${search}`}>
                    <Button key={extractor.externalId} type="primary">
                      {t('connect-to-hosted-extractor', {
                        extractor: extractor?.name,
                      })}
                    </Button>
                  </Link>
                </Flex>
                {genericLinks?.length > 0 && (
                  <>
                    <StyledDivider />
                    <Heading level={5}>{t('links')}</Heading>
                    <Flex direction="column" gap={12}>
                      {genericLinks?.map((link) => (
                        <StyledLink
                          className="cogs-anchor"
                          href={link?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={link?.url}
                        >
                          <Flex gap={9} alignItems="center">
                            <span>{link?.name}</span>
                            <Icon type="ExternalLink" />
                          </Flex>
                        </StyledLink>
                      ))}
                    </Flex>
                  </>
                )}
                {tags?.length > 0 && (
                  <>
                    <StyledDivider />
                    <Heading level={5}>{t('tags')}</Heading>
                    <StyledTagsContainer>
                      {tags?.map((tag) => (
                        <Chip selectable size="x-small" label={tag} key={tag} />
                      ))}
                    </StyledTagsContainer>
                  </>
                )}
              </Flex>
            </aside>
          </StyledLayoutGrid>
        </Layout.Container>
      </ContentContainer>
      <CreateConnectionModal
        onCancel={() => setIsModalOpen(false)}
        visible={isModalOpen}
      />
    </Layout>
  );
};
