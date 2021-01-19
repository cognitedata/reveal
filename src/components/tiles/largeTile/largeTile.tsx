import React from 'react';
import styled from 'styled-components/macro';
import { Overline, Title, Tooltip } from '@cognite/cogs.js';
import { Flex, SpaceBetween } from 'styles/common';
import uc2Background from 'images/uc2_test_944_531.jpg';

const TileBasic = styled.div`
  display: inline-flex;
  cursor: pointer;
  background-color: var(--cogs-white);
  &:hover {
    box-shadow: var(--cogs-z-4);
  }
`;

export const SmallTileContainer = styled(TileBasic)`
  width: 298px;
  border-radius: 2px;
  border: 1px solid var(--cogs-greyscale-grey4);
`;

export const TileContainer = styled(TileBasic)`
  position: relative;
  flex-direction: column;
  width: 946px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin: 0 48px 24px 0;
`;

export const TileDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 8px;
  overflow: hidden;
  & > span {
    display: grid;
  }
`;

export const TileHeader = styled(SpaceBetween)`
  padding: 8px 12px;
  height: 56px;
  display: flex;
  align-items: center;
`;

export const TilePreview = styled.div`
  display: flex;
  align-items: center;
  height: 532px;
  background-color: var(--cogs-white);
`;

export const StyledTitle = styled(Title)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const LargeTile: React.FC = () => {
  return (
    <TileContainer>
      <TileHeader>
        <Flex>
          <TileDescription>
            <Overline level={3}>Infographics</Overline>
            <Tooltip content="UC2">
              <StyledTitle level={6}>UC2</StyledTitle>
            </Tooltip>
          </TileDescription>
        </Flex>
      </TileHeader>
      <TilePreview>
        <img src={uc2Background} alt="uc2" />
      </TilePreview>
    </TileContainer>
  );
};
