import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';

const TileBasic = styled.div`
  display: inline-flex;
  cursor: pointer;
  background-color: var(--cogs-white);
  &:hover {
    box-shadow: var(--cogs-z-4);
  }
`;

export const SmallTileContainer = styled(TileBasic)`
  width: 208px;
  border-radius: 2px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin: 10px 10px 0 0;
`;

export const TileContainer = styled(TileBasic)`
  position: relative;
  flex-direction: column;
  width: 300px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin: 24px 48px 0 0;
`;

export const TileDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 8px;
  overflow: hidden;
`;

export const TileOverline = styled.div<{ isBoard?: boolean }>`
  & > .cogs-overline-3 {
    color: ${({ isBoard }) =>
      isBoard ? 'var(--cogs-midblue-3)' : 'var(--cogs-text-color)'};
  }
`;

export const TileHeader = styled.div<{ isBoard?: boolean; color?: string }>`
  padding: 12px;
  display: flex;
  align-items: center;
  background-color: ${({ isBoard, color }) =>
    isBoard ? `${color}` : 'var(--cogs-white)'};
  border-bottom: ${({ isBoard }) =>
    isBoard ? 'none' : '1px solid var(--cogs-greyscale-grey4)'};
  & > :last-child {
    margin-left: auto;
  }
`;

export const TilePreview = styled.div`
  display: flex;
  align-items: center;
  height: 184px;
  background-color: var(--cogs-white);
  padding: 12px;
`;

export const StyledTitle = styled(Title)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
