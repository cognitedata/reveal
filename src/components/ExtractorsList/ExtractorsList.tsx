import { Link, useParams } from 'react-router-dom';

import { Body, Colors, Elevations, Flex, Title } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import styled from 'styled-components';

import { trackUsage } from 'utils';

type ExtractorsListProps = {
  extractorsList: any[];
};

const ExtractorsList = ({ extractorsList }: ExtractorsListProps) => {
  const { subAppPath } = useParams<{ subAppPath?: string }>();

  return (
    <StyledGrid>
      {extractorsList?.map((extractor) => (
        <StyledExtractorContainer
          key={extractor.externalId}
          to={createLink(`/${subAppPath}/${extractor.externalId}`)}
          onClick={() => {
            trackUsage({ e: 'View.Extractor.Click', name: extractor.name });
          }}
        >
          <Flex gap={12} direction="column">
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
  );
};

export default ExtractorsList;

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
