import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import fileDownload from 'js-file-download';
import ReactMarkdown from 'react-markdown';
import {
  Body,
  Button,
  Colors,
  Flex,
  formatDate,
  Icon,
  Label,
  Loader,
  Title,
} from '@cognite/cogs.js';
import { Collapse, Modal } from 'antd';
import { DetailsHeader } from 'components/DetailsHeader';
import { Layout } from 'components/Layout';
import { useExtractorsList } from 'hooks/useExtractorsList';
import { ContentContainer } from 'components/ContentContainer';
import { useTranslation } from 'common';
import { Artifact, getDownloadUrl } from 'service/extractors';
import { DocsLinkGrid, DocsLinkGridItem } from 'components/DocsLinkGrid';

const ExtractorDetails = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { extractorExternalId } = useParams<{ extractorExternalId?: string }>();
  const { data, status } = useExtractorsList();

  const extractor = data?.find(
    (extractor) => extractor.externalId === extractorExternalId
  );

  const latestRelease = extractor?.releases?.at(0);
  const createdAt =
    latestRelease?.createdTime && formatDate(latestRelease?.createdTime);

  const artifacts = latestRelease?.artifacts ?? [];

  const handleDownload = async (artifact: Artifact) => {
    const url = await getDownloadUrl(artifact);
    const response = await fetch(url);
    const data = await response.blob();
    fileDownload(data, artifact.name);
  };

  const tags = extractor?.tags ?? [];

  const externalLinks =
    extractor?.links?.filter(
      (link) => link?.type === 'externalDocumentation'
    ) ?? [];

  const genericLinks =
    extractor?.links?.filter((link) => link?.type === 'generic') ?? [];

  if (status === 'loading') {
    return <Loader />;
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
            <Flex direction="column" gap={56}>
              <StyledBody>
                <ReactMarkdown>
                  {(extractor?.documentation || extractor?.description) ?? ''}
                </ReactMarkdown>
              </StyledBody>
              {externalLinks?.length > 0 && (
                <Flex direction="column" gap={16}>
                  <Title level="4">{t('user-guide-from-cognite-docs')}</Title>
                  <DocsLinkGrid>
                    {externalLinks?.map((link) => (
                      <DocsLinkGridItem key={link?.name} href={link?.url}>
                        {link?.name}
                      </DocsLinkGridItem>
                    ))}
                  </DocsLinkGrid>
                </Flex>
              )}
            </Flex>
            <aside>
              <Flex direction="column" gap={24}>
                {artifacts?.length > 0 && (
                  <Flex direction="column" gap={16}>
                    <Title level="5">{t('download-extractor')}</Title>
                    {artifacts.map((artifact) => (
                      <Button
                        key={artifact?.link}
                        type={
                          artifact?.platform === 'docs'
                            ? 'secondary'
                            : 'primary'
                        }
                        icon="Download"
                        iconPlacement="right"
                        size="large"
                        onClick={() => {
                          handleDownload(artifact);
                        }}
                      >
                        {artifact.displayName}
                      </Button>
                    ))}
                  </Flex>
                )}
                <StyledDivider />
                <Flex justifyContent="space-between" alignItems="center">
                  <Title level="5">{t('versions')}</Title>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setIsModalOpen(true);
                    }}
                  >
                    {t('view-all')}
                  </Button>
                </Flex>
                <Flex gap={8} direction="column">
                  <Flex gap={8}>
                    <Label size="small">
                      {t('v-version', {
                        version: latestRelease?.version,
                      })}
                    </Label>
                    <StyledBodyMuted>
                      {t('released-date', {
                        createdAt,
                      })}
                    </StyledBodyMuted>
                  </Flex>
                  <Body level="2">{latestRelease?.description}</Body>
                </Flex>
                {genericLinks?.length > 0 && (
                  <>
                    <StyledDivider />
                    <Title level="5">{t('links')}</Title>
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
                    <Title level="5">{t('tags')}</Title>
                    <StyledTagsContainer>
                      {tags?.map((tag) => (
                        <Label size="small" key={tag}>
                          {tag}
                        </Label>
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
        visible={isModalOpen}
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
                    <Title level="5">
                      {t('version-n', {
                        version: release.version,
                      })}
                    </Title>
                    <StyledBodyMuted>
                      {release?.createdTime && formatDate(release?.createdTime)}
                    </StyledBodyMuted>
                  </Flex>
                  <Body level="2">{release.description}</Body>
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
                        <Body level="3" strong>
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
                                    <Body level="3">{value}</Body>
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
                  <Body level="2" strong>
                    {t('download-colon')}
                  </Body>
                  {release.artifacts?.map((artifact) => (
                    <Button
                      key={artifact.link}
                      type="link"
                      icon="Download"
                      iconPlacement="right"
                      onClick={() => handleDownload(artifact)}
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

const StyledLayoutGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 296px;
  gap: 56px;
`;

const StyledBody = styled.div``;

const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${Colors['border--muted']};
`;

const StyledBodyMuted = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--muted']};
`;

const StyledLink = styled.a`
  color: ${Colors['text-icon--strong']};
`;

const StyledTagsContainer = styled.div`
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
