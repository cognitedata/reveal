import styled from 'styled-components/macro';

const TileBasic = styled.div`
  display: inline-flex;
  cursor: pointer;
  background-color: var(--cogs-white);
  &:hover {
    box-shadow: var(--cogs-z-4);
  }
`;

export const SmallTileContainer = styled(TileBasic)`
  min-width: 208px;
  border-radius: 4px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin: 10px 10px 0 0;
`;

export const TileContainer = styled(TileBasic)`
  position: relative;
  flex-direction: column;
  width: 300px;
  border-radius: 2px;
  box-shadow: var(--cogs-z-2);
  margin: 24px 48px 0 0;
`;

export const TileDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 8px;
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

  & > :last-child {
    margin-left: auto;
  }
`;

export const TilePreview = styled.div<{ isBoard?: boolean }>`
  height: 184px;
  background-color: ${({ isBoard }) =>
    isBoard ? 'var(--cogs-white)' : 'var(--cogs-greyscale-grey3)'};
`;
