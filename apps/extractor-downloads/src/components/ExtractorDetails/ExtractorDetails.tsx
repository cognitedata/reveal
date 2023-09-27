import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { Collapse, Modal } from 'antd';

import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  Chip,
  Loader,
  Heading,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { useExtractorsList } from '../../hooks/useExtractorsList';
import { useSolutionsForExtractor } from '../../hooks/useSolutions';
import { Artifact, getDownloadUrl } from '../../service/extractors';
import {
  trackUsage,
  formatTimeStamp,
  getReleaseVersionCore,
} from '../../utils';
import { ContentContainer } from '../ContentContainer';
import { DetailsHeader } from '../DetailsHeader';
import { DocsLinkGrid, DocsLinkGridItem } from '../DocsLinkGrid';
import { Dropdown } from '../Dropdown';
import { HostedExtractorDetails } from '../hosted-extractor-details/HostedExtractorDetails';
import { Layout } from '../Layout';
import Markdown from '../markdown';
import { ReleaseTag } from '../ReleaseTag';
import SolutionForExtractor from '../solution/SolutionForExtractor';

const ExtractorDetails = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { extractorExternalId = '' } = useParams<{
    extractorExternalId?: string;
  }>();
  const { data, status } = useExtractorsList();

  const extractor = data?.find(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (extractor) => extractor.externalId === extractorExternalId
  );

  const { data: solutions } = useSolutionsForExtractor(extractorExternalId);

  const latestRelease = extractor?.releases?.at(0);
  const createdAt =
    latestRelease?.createdTime && formatTimeStamp(latestRelease?.createdTime);

  const artifacts = latestRelease?.artifacts ?? [];

  const handleDownload = useCallback(async (artifact: Artifact) => {
    const url = await getDownloadUrl(artifact);
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const tags = extractor?.tags ?? [];

  const externalLinks =
    extractor?.links?.filter(
      (link) => link?.type === 'externalDocumentation'
    ) ?? [];

  const genericLinks =
    extractor?.links?.filter((link) => link?.type === 'generic') ?? [];

  const handleDownloadClick = useCallback(
    async (artifact: any) => {
      trackUsage({
        e: 'Download.Extractor.Click',
        name: extractor?.name,
        artifact: artifact.displayName,
        version: latestRelease?.version,
      });
      await handleDownload(artifact);
    },
    [handleDownload, extractor, latestRelease]
  );

  if (status === 'loading') {
    return <Loader />;
  }

  if (extractor?.type === 'hosted') {
    return <HostedExtractorDetails extractor={extractor} />;
  }
  return (
    <Layout>
      <DetailsHeader
        imageUrl={extractor?.imageUrl}
        title={String(extractor?.name)}
        version={String(latestRelease?.version)}
        createdAt={String(createdAt)}
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
              {!!solutions?.length && (
                <Flex direction="column" gap={16}>
                  <Heading level={5}>
                    {t('use-extractor-for-with-colon', {
                      extractor: extractor?.name,
                    })}
                  </Heading>
                  {solutions.map((solution) => (
                    <SolutionForExtractor
                      key={solution.externalId}
                      {...solution}
                    />
                  ))}
                </Flex>
              )}
            </Flex>
            <aside>
              <Flex direction="column" gap={24}>
                <Flex direction="column" gap={16}>
                  <Dropdown
                    title={t('download-extractor')}
                    options={artifacts.map((artifact) => ({
                      label: artifact.displayName || '',
                      icon: 'Download',
                      onClick: () => handleDownloadClick(artifact),
                    }))}
                  />
                </Flex>
                <StyledDivider />
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={5}>{t('versions')}</Heading>
                  <Button
                    type="ghost-accent"
                    size="small"
                    onClick={() => {
                      trackUsage({
                        e: 'Versions.ViewAll.Click',
                        name: extractor?.name,
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    {t('view-all')}
                  </Button>
                </Flex>
                <Flex gap={8} direction="column">
                  <Flex gap={8}>
                    <Chip
                      label={t('v-version', {
                        version: getReleaseVersionCore(latestRelease?.version),
                      })}
                      selectable
                      size="x-small"
                    />
                    <ReleaseTag version={latestRelease?.version}></ReleaseTag>
                  </Flex>
                  <Flex gap={8}>
                    <StyledBodyMuted>
                      {t('released-date', {
                        createdAt,
                      })}
                    </StyledBodyMuted>
                  </Flex>
                  <Body size="medium">{latestRelease?.description}</Body>
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
      <StyledModal
        open={isModalOpen}
        title={t('all-versions-of-extractor', { extractor: extractor?.name })}
        closeIcon={<Icon type="Close" />}
        width={840}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        footer={
          <Button
            onClick={() => {
              setIsModalOpen(false);
            }}
            type="secondary"
          >
            {t('close')}
          </Button>
        }
      >
        <StyledModalListContainer>
          {extractor?.releases?.map((release) => (
            <StyledModalListItem key={release.version}>
              <Flex direction="column" gap={12}>
                <Flex direction="column" gap={8}>
                  <Flex justifyContent="space-between" gap={8}>
                    <Heading level={5}>
                      <Flex gap={8}>
                        {t('version-n', {
                          version: getReleaseVersionCore(release.version),
                        })}
                        <ReleaseTag version={release.version}></ReleaseTag>
                      </Flex>
                    </Heading>
                    <StyledBodyMuted>
                      {release?.createdTime &&
                        formatTimeStamp(release?.createdTime)}
                    </StyledBodyMuted>
                  </Flex>
                  <Body size="medium">{release.description}</Body>
                </Flex>
                {Object.values(release?.changelog).length > 0 && (
                  <StyledCollapse
                    defaultActiveKey={[]}
                    expandIcon={({ isActive }) => {
                      return <StyledExpandIcon $isActive={isActive} />;
                    }}
                  >
                    <StyledCollapsePanel
                      header={
                        <Body size="small" strong>
                          {t('changelog')}
                        </Body>
                      }
                      key="1"
                    >
                      <Flex gap={12} direction="column">
                        {Object.entries(release?.changelog)?.map(
                          ([key, values]) => (
                            <Flex direction="column" gap={2} key={key}>
                              <StyledChangelogListHeader>
                                {key}
                              </StyledChangelogListHeader>
                              <StyledChangelogList>
                                {values.map((value) => (
                                  <li key={value}>
                                    <Body size="small">{value}</Body>
                                  </li>
                                ))}
                              </StyledChangelogList>
                            </Flex>
                          )
                        )}
                      </Flex>
                    </StyledCollapsePanel>
                  </StyledCollapse>
                )}
                <Flex gap={8} alignItems="center">
                  <Body size="medium" strong>
                    {t('download-colon')}
                  </Body>
                  {release.artifacts?.map((artifact) => (
                    <Button
                      key={artifact.link}
                      type="ghost-accent"
                      icon="Download"
                      iconPlacement="right"
                      onClick={() => {
                        trackUsage({
                          e: 'Versions.Download.Click',
                          name: extractor?.name,
                          version: release.version,
                          artifact: artifact.displayName,
                        });
                        handleDownload(artifact);
                      }}
                      size="small"
                    >
                      {artifact.displayName}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            </StyledModalListItem>
          ))}
        </StyledModalListContainer>
      </StyledModal>
    </Layout>
  );
};

export default ExtractorDetails;

export const StyledLayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 296px;
  gap: 56px;
`;

export const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${Colors['border--muted']};
`;

const StyledBodyMuted = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--muted']};
`;

export const StyledLink = styled.a`
  color: ${Colors['text-icon--strong']};

  :hover {
    text-decoration: underline;
  }
`;

export const StyledTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const StyledModal = styled(Modal)`
  .ant-modal-body {
    max-height: 500px;
    overflow: auto;
  }
`;

const StyledModalListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledModalListItem = styled.div`
  padding: 16px 24px;
  border: 1px solid ${Colors['border--muted']};
  border-radius: 4px;
`;

const StyledCollapse = styled(Collapse)`
  background-color: white;
  border: none;

  .ant-collapse-header {
    padding: 8px !important;
  }

  .ant-collapse-content {
    background-color: white;
    border: none;
  }

  .ant-collapse-item {
    border: none;
  }
`;

const StyledCollapsePanel = styled(Collapse.Panel)`
  padding: 0;

  .ant-collapse-content-box {
    padding: 0 16px;
  }
`;

const StyledChangelogList = styled.ul`
  display: flex;
  flex-direction: column;
  margin-bottom: 0;
`;

const StyledChangelogListHeader = styled(Body).attrs({
  level: 3,
  strong: true,
})`
  text-transform: capitalize;
`;

const StyledExpandIcon = styled((props: any) => {
  return <Icon type="ChevronRight" {...props} />;
})`
  transition: transform 100ms ease;
  transform: ${({ $isActive }) =>
    $isActive ? 'rotate(90deg)' : 'rotate(0deg)'};
`;
