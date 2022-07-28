import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import fileDownload from 'js-file-download';
import {
  Body,
  Button,
  Colors,
  Flex,
  Icon,
  Label,
  Title,
} from '@cognite/cogs.js';
import { DetailsHeader } from 'components/DetailsHeader';
import { Layout } from 'components/Layout';
import { useExtractorsList } from 'hooks/useExtractorsList';
import { ContentContainer } from 'components/ContentContainer';
import { extractorsListExtended } from 'utils/extractorsListExtended';
import { useTranslation } from 'common';
import { Artifact, Release } from 'service/extractors';
import { Skeleton } from 'antd';

const hasDocs = (artifact: Artifact) => artifact.platform === 'docs';
const createdTimeSorter = (releaseA: Release, releaseB: Release) =>
  (releaseA?.createdTime ?? 0) - (releaseB?.createdTime ?? 0) || -1;

const ExtractorDetails = () => {
  const { t } = useTranslation();
  const { extractorExternalId } = useParams<{ extractorExternalId?: string }>();
  const { data, isFetched } = useExtractorsList();

  const extractor = data?.find(
    (extractor) => extractor.externalId === extractorExternalId
  );

  const latestRelease = extractor?.releases?.at(0);
  const createdAt =
    latestRelease?.createdTime &&
    new Date(latestRelease?.createdTime!).toLocaleDateString();

  const extractorExtended = extractorsListExtended?.[extractorExternalId!];
  const { body, links, tags, source, docs } = extractorExtended;

  const latestReleaseWithDocs = extractor?.releases
    ?.slice(0)
    ?.sort(createdTimeSorter)
    ?.find((release) => release?.artifacts?.find(hasDocs));
  const latestDocs = latestReleaseWithDocs?.artifacts.find(hasDocs);

  const latestReleaseDocs = latestRelease?.artifacts?.find(hasDocs);

  const artifacts = latestRelease?.artifacts ?? [];

  const noDocsInLatestRelease = !latestReleaseDocs;
  const hasLatestDocs = !!latestDocs;

  return (
    <Layout>
      <DetailsHeader
        isFetched={isFetched}
        title={String(extractor?.name)}
        version={String(latestRelease?.version)}
        createdAt={String(createdAt)}
      />
      <ContentContainer>
        <Layout.Container>
          <StyledLayoutGrid>
            {isFetched ? (
              <Flex direction="column" gap={56}>
                <StyledBody>{body}</StyledBody>
                {links.length > 0 && (
                  <Flex direction="column" gap={16}>
                    <Title level="4">{t('user-guide-from-cognite-docs')}</Title>
                    <StyledItemsGrid>
                      {links.map((link) => (
                        <GridItemLink key={link.url} href={link.url}>
                          {link.title}
                        </GridItemLink>
                      ))}
                    </StyledItemsGrid>
                  </Flex>
                )}
              </Flex>
            ) : (
              <Skeleton />
            )}
            {isFetched ? (
              <aside>
                <Flex direction="column" gap={24}>
                  {artifacts?.length > 0 && (
                    <Flex direction="column" gap={16}>
                      <Title level="5">{t('download-extractor')}</Title>
                      {artifacts.map((artifact) => (
                        <Button
                          key={artifact.link}
                          type={
                            artifact.platform === 'docs'
                              ? 'secondary'
                              : 'primary'
                          }
                          icon="Download"
                          iconPlacement="right"
                          size="large"
                          onClick={() => {
                            fileDownload(artifact.link, artifact.name);
                          }}
                        >
                          {artifact.displayName}
                        </Button>
                      ))}
                      {noDocsInLatestRelease && hasLatestDocs && (
                        <Button
                          type="secondary"
                          icon="Download"
                          iconPlacement="right"
                          size="large"
                          onClick={() => {
                            fileDownload(
                              latestDocs?.link ?? '',
                              latestDocs?.name
                            );
                          }}
                        >
                          {latestDocs?.displayName}
                        </Button>
                      )}
                    </Flex>
                  )}
                  <StyledDivider />
                  <Flex justifyContent="space-between" alignItems="center">
                    <Title level="5">{t('versions')}</Title>
                    <Button href="#" type="link" size="small">
                      {t('view-all')}
                    </Button>
                  </Flex>
                  <Flex gap={8} direction="column">
                    <Flex gap={8}>
                      <Label size="small">
                        {t('v-version-number', {
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
                  {source ||
                    (docs && (
                      <>
                        <StyledDivider />
                        <Title level="5">{t('links')}</Title>
                        <Flex direction="column" gap={12}>
                          {docs && (
                            <StyledButtonLink href={docs}>
                              {t('cognite-docs')}
                            </StyledButtonLink>
                          )}
                          {source && (
                            <StyledButtonLink href={source}>
                              {t('github')}
                            </StyledButtonLink>
                          )}
                        </Flex>
                      </>
                    ))}
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
            ) : (
              <Skeleton />
            )}
          </StyledLayoutGrid>
        </Layout.Container>
      </ContentContainer>
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

const StyledItemsGrid = styled.div`
  display: grid;
  justify-content: space-between;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`;

const GridItemLink = styled((props) => (
  <Button type="link" target="_blank" rel="noopener noreferrer" {...props}>
    <Title level="5">{props.children}</Title>
    <Icon type="ExternalLink" />
  </Button>
))`
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${Colors['decorative--grayscale--200']};
  border-radius: 6px;

  && {
    height: auto;
    padding: 24px;
  }

  > * {
    color: ${Colors['text-icon--medium']};
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
