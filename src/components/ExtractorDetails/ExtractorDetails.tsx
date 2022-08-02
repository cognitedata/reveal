import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
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
import { Modal } from 'antd';
import { DetailsHeader } from 'components/DetailsHeader';
import { Layout } from 'components/Layout';
import { useExtractorsList } from 'hooks/useExtractorsList';
import { ContentContainer } from 'components/ContentContainer';
import { extractorsListExtended } from 'utils/extractorsListExtended';
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

  const extractorExtended = extractorsListExtended?.[extractorExternalId!];
  const { links, tags, source, docs } = extractorExtended;

  const artifacts = latestRelease?.artifacts ?? [];

  const handleDownload = async (artifact: Artifact) => {
    const url = await getDownloadUrl(artifact);
    fileDownload(url, artifact.name);
  };

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <Layout>
      <DetailsHeader
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
              {links.length > 0 && (
                <Flex direction="column" gap={16}>
                  <Title level="4">{t('user-guide-from-cognite-docs')}</Title>
                  <DocsLinkGrid>
                    {links.map((link) => (
                      <DocsLinkGridItem key={link.url} href={link.url}>
                        {link.title}
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
                        key={artifact.link}
                        type={
                          artifact.platform === 'docs' ? 'secondary' : 'primary'
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
                {/* Only display the "Links" section if we have either the source code or docs. */}
                {(source || docs) && (
                  <>
                    <StyledDivider />
                    <Title level="5">{t('links')}</Title>
                    <Flex direction="column" gap={12}>
                      {/* The extractor might not have an entry in the Cognite Docs. */}
                      {docs && (
                        <StyledButtonLink href={docs}>
                          {t('cognite-docs')}
                        </StyledButtonLink>
                      )}
                      {/* Some repositories have their source code private, thus we can't share it for people without access. */}
                      {source && (
                        <StyledButtonLink href={source}>
                          {t('github')}
                        </StyledButtonLink>
                      )}
                    </Flex>
                  </>
                )}
                {tags.length > 0 && (
                  <>
                    <StyledDivider />
                    <Title level="5">{t('tags')}</Title>
                    <StyledTagsContainer>
                      {tags.map((tag) => (
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
              <Flex direction="column" gap={16}>
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

const titleSpacing = css`
  margin-bottom: 2rem;
`;

const bodySpacing = css`
  margin-bottom: 1rem;
`;

const StyledBody = styled.div`
  color: var(--cogs-text-color);

  h1 {
    color: var(--cogs-t1-color);
    font-size: var(--cogs-t1-font-size);
    letter-spacing: var(--cogs-t1-letter-spacing);
    line-height: var(--cogs-t1-line-height);
    ${titleSpacing};
  }

  h2 {
    color: var(--cogs-t2-color);
    font-size: var(--cogs-t2-font-size);
    letter-spacing: var(--cogs-t2-letter-spacing);
    line-height: var(--cogs-t2-line-height);
    ${titleSpacing};
  }

  h3 {
    color: var(--cogs-t3-color);
    font-size: var(--cogs-t3-font-size);
    letter-spacing: var(--cogs-t3-letter-spacing);
    line-height: var(--cogs-t3-line-height);
    ${titleSpacing};
  }

  h4 {
    color: var(--cogs-t4-color);
    font-size: var(--cogs-t4-font-size);
    letter-spacing: var(--cogs-t4-letter-spacing);
    line-height: var(--cogs-t4-line-height);
    ${titleSpacing};
  }

  h5 {
    color: var(--cogs-t5-color);
    font-size: var(--cogs-t5-font-size);
    font-weight: 600;
    letter-spacing: var(--cogs-t5-letter-spacing);
    line-height: var(--cogs-t5-line-height);
    ${titleSpacing};
  }

  h6 {
    color: var(--cogs-t6-color);
    font-size: var(--cogs-t6-font-size);
    font-weight: 600;
    letter-spacing: var(--cogs-t6-letter-spacing);
    line-height: var(--cogs-t6-line-height);
    ${titleSpacing};
  }

  ul,
  ol,
  li {
    font-size: var(--cogs-b1-font-size);
    line-height: var(--cogs-b1-line-height);
    letter-spacing: var(--cogs-b1-letter-spacing);
    padding-left: 1.25rem;
    padding-bottom: 0.75rem;
  }

  p {
    font-size: var(--cogs-b1-font-size);
    line-height: var(--cogs-b1-line-height);
    letter-spacing: var(--cogs-b1-letter-spacing);
    ${bodySpacing};
  }

  *:last-child {
    margin-bottom: 0;
  }
`;

const StyledDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${Colors['border--muted']};
`;

const StyledBodyMuted = styled(Body).attrs({ level: 2 })`
  color: ${Colors['text-icon--muted']};
`;

const StyledButtonLink = styled(Button).attrs({
  type: 'link',
  icon: 'ExternalLink',
  iconPlacement: 'right',
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  && {
    display: inline-flex;
    justify-content: flex-start;
    flex-grow: 0;
    align-self: flex-start;
    width: auto;
    color: ${Colors['text-icon--strong']};
    svg {
      color: inherit;
    }
  }
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
