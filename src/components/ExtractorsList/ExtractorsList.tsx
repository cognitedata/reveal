import { Body, Colors, Elevations, Flex, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { Link, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import { trackUsage } from 'utils';

type ExtractorsListProps = {
  extractorsList: any[];
};

const ExtractorsList = ({ extractorsList }: ExtractorsListProps) => {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{ subAppPath?: string }>();

  return (
    <Flex gap={24} direction="column">
      <Flex gap={4} direction="column">
        <Title level="4">{t('cognite-extractors')}</Title>
        <Body level="1">{t('install-prebuilt-cognite-extractors')}</Body>
      </Flex>
      <StyledGrid>
        {extractorsList?.map((extractor) => (
          <StyledExtractorContainer
            key={extractor.externalId}
            to={createLink(`/${subAppPath}/${extractor.externalId}`)}
            onClick={() => {
              trackUsage({ e: 'View.Extractor.Click', name: extractor.name });
            }}
          >
            <Flex gap={24} direction="column">
              {extractor?.imageUrl && (
                <div>
                  <img src={extractor?.imageUrl} />
                </div>
              )}
              <Flex gap={8} direction="column">
                <Title level="5">{extractor.name}</Title>
                <StyledMutedDescription>
                  {extractor.description}
                </StyledMutedDescription>
              </Flex>
            </Flex>
          </StyledExtractorContainer>
        ))}
      </StyledGrid>
    </Flex>
  );
};

export default ExtractorsList;

const StyledGrid = styled.div`
  --cell: minmax(256px, 1fr);

  display: grid;
  justify-content: space-between;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, var(--cell));

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, var(--cell));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, var(--cell));
  }

  @media (min-width: 1440px) {
    grid-template-columns: repeat(4, var(--cell));
  }
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
    padding: 24px;
    height: auto;
  }
`;

const StyledMutedDescription = styled(Body).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
`;
