import {
  Body,
  Button,
  Colors,
  Elevations,
  Flex,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import { useExtractorsList } from 'hooks/useExtractorsList';
import {
  ExtractorExtended,
  extractorsListExtended,
} from 'utils/extractorsListExtended';
import { Skeleton } from 'antd';
import { ExtractorWithRelease } from 'service/extractors';

type ExtractorsListProps = {
  search: string;
};

type TExtractorsListExtended = typeof extractorsListExtended;
type ExtractorWithReleaseExtended = ExtractorWithRelease & ExtractorExtended;

const mergeExtractorsExtended = (
  extractors: ExtractorWithRelease[],
  extractorsListExtended: TExtractorsListExtended
): ExtractorWithReleaseExtended[] => {
  return extractors.map((extractor) => {
    return { ...extractorsListExtended[extractor.externalId], ...extractor };
  });
};

const ExtractorsList = ({ search = '' }: ExtractorsListProps) => {
  const { t } = useTranslation();
  const { data: extractors, isFetched } = useExtractorsList();
  const history = useHistory();
  const { subAppPath } = useParams<{ subAppPath?: string }>();
  const extractorsList = mergeExtractorsExtended(
    extractors ?? [],
    extractorsListExtended
  ).filter((extractor) => {
    const searchLowercase = search.toLowerCase();
    if (extractor.description?.toLowerCase()?.includes(searchLowercase)) {
      return true;
    }
    if (extractor.name.toLowerCase().includes(searchLowercase)) {
      return true;
    }
    if (extractor.tags.map((t) => t.toLowerCase()).includes(searchLowercase)) {
      return true;
    }
    return false;
  }, []);
  return (
    <Flex gap={24} direction="column">
      <Flex gap={4} direction="column">
        <Title level="4">{t('cognite-extractors')}</Title>
        <Body level="1">{t('install-prebuilt-cognite-extractors')}</Body>
      </Flex>
      <StyledGrid>
        {isFetched ? (
          <>
            {extractorsList?.map((extractor) => (
              <StyledExtractorContainer
                key={extractor.externalId}
                onClick={() => {
                  history.push(
                    createLink(`/${subAppPath}/${extractor.externalId}`)
                  );
                }}
              >
                <Flex gap={24} direction="column">
                  <div>
                    <img
                      src={
                        extractorsListExtended?.[extractor.externalId]
                          ?.imagePath
                      }
                    />
                  </div>
                  <Flex gap={8} direction="column">
                    <Title level="5">{extractor.name}</Title>
                    <StyledMutedDescription>
                      {extractor.description}
                    </StyledMutedDescription>
                  </Flex>
                </Flex>
              </StyledExtractorContainer>
            ))}
          </>
        ) : (
          <>
            <StyledSkeletonAvatar />
            <StyledSkeletonAvatar />
            <StyledSkeletonAvatar />
            <StyledSkeletonAvatar />
            <StyledSkeletonAvatar />
            <StyledSkeletonAvatar />
          </>
        )}
      </StyledGrid>
    </Flex>
  );
};

export default ExtractorsList;

const StyledGrid = styled.div`
  display: grid;
  justify-content: space-between;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
`;

const StyledExtractorContainer = styled(Button).attrs({ type: 'ghost' })`
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 500ms ease;
  min-height: 212px;

  &:hover {
    background-color: white;
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }

  && {
    padding: 24px;
    height: auto;
  }
`;

const StyledMutedDescription = styled(Body).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
`;

const StyledSkeletonAvatar = styled((props) => (
  <Skeleton.Avatar shape="square" {...props} />
))`
  .ant-skeleton-avatar {
    border-radius: 6px;
    width: 100%;
    height: 100%;
    min-height: 212px;
  }
`;
