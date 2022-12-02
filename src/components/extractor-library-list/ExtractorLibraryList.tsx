import { Link, useParams } from 'react-router-dom';

import { Body, Chip, Colors, Elevations, Flex, Title } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';

import { trackUsage } from 'utils';
import { ExtractorBase } from 'service/extractors';
import { ExtractorLibraryCategory } from 'components/category-sidebar/CategorySidebarItem';
import { useTranslation } from 'common';

export type ExtractorLibraryItem = ExtractorBase & {
  category: ExtractorLibraryCategory;
};

type ExtractorLibraryListProps = {
  items: ExtractorLibraryItem[];
};

const ExtractorLibraryList = ({ items }: ExtractorLibraryListProps) => {
  const { t } = useTranslation();

  const { subAppPath } = useParams<{ subAppPath?: string }>();

  return (
    <StyledGrid>
      {items?.map((item) => (
        <StyledExtractorContainer
          key={item.externalId}
          to={createLink(`/${subAppPath}/${item.externalId}`)}
          onClick={() => {
            trackUsage({ e: 'View.Extractor.Click', name: item.name });
          }}
        >
          <StyledExtractorContent>
            {item?.imageUrl && (
              <div>
                <img src={item?.imageUrl} />
              </div>
            )}
            <Flex gap={8} direction="column">
              <Title level="5">{item.name}</Title>
              <StyledMutedDescription>
                {item.description}
              </StyledMutedDescription>
            </Flex>
            <StyledTagContainer>
              <Chip label={t(`${item.category}_one`)} size="x-small" />
            </StyledTagContainer>
          </StyledExtractorContent>
        </StyledExtractorContainer>
      ))}
    </StyledGrid>
  );
};

const StyledTagContainer = styled.div`
  margin-top: auto;
`;

const StyledExtractorContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
`;

const StyledGrid = styled.div`
  --cell: minmax(256px, 1fr);

  display: grid;
  justify-content: space-between;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, var(--cell));
`;

const StyledExtractorContainer = styled(Link)`
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
    padding: 20px;
    height: auto;
  }
`;

const StyledMutedDescription = styled(Body).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
`;

export default ExtractorLibraryList;
