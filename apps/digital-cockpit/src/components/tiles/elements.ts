import styled from 'styled-components/macro';
import { Title } from '@cognite/cogs.js';
import { SpaceBetween } from 'styles/common';

const TileBasic = styled.div`
  display: inline-flex;
  cursor: pointer;
  background-color: var(--cogs-white);
  border-radius: 4px;
  box-shadow: var(--cogs-z-2);

  &:hover {
    box-shadow: var(--cogs-z-8);
  }
`;

export const SmallTileContainer = styled(TileBasic)`
  width: 298px;
  border-radius: 2px;
  border: 1px solid var(--cogs-greyscale-grey4);
  margin-bottom: 24px;
`;

export const ApplicationTileContainer = styled(SmallTileContainer)`
  position: relative;
  flex-direction: column;
  margin: 0 48px 24px 0;
`;

export const SubSuiteTileContainer = styled(SmallTileContainer)`
  justify-content: space-between;
  padding: 10px;
  margin: 0 48px 24px 0;
  .flex-aligned-content {
    display: flex;
    align-items: center;
  }
`;

export const TileContainer = styled(TileBasic)<{
  isBoard?: boolean;
}>`
  position: relative;
  flex-direction: column;
  width: ${({ isBoard }) => (isBoard ? '100%' : '307px')};
  height: 100%;
  margin: 0 48px 24px 0;
  border-radius: 4px;
  .iframe-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 8px 8px;
    height: 184px;

    iframe {
      border-radius: 4px;
      border: 1px solid var(--cogs-greyscale-grey4);
      width: 100%;
      height: 100%;
    }
  }
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
  & > p {
    color: var(--cogs-greyscale-grey6);
  }
`;

export const TileHeader = styled(SpaceBetween)<{
  isBoard?: boolean;
  color?: string;
}>`
  display: flex;
  align-items: center;
  background-color: var(--cogs-white);
  width: -webkit-fill-available;
  padding: 0 8px 0 12px;
  ${({ isBoard }) =>
    !isBoard && 'border-bottom: 1px solid var(--cogs-greyscale-grey4);'}
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  height: 60px;

  & > div {
    align-items: center;
  }
`;

export const TilePreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100% - 56px);
  background-color: var(--cogs-white);
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
  min-height: 184px;

  & > .cogs-detail {
    border-radius: 4px;
    width: 264px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--cogs-greyscale-grey7);
  }
`;

export const ApplicationTileHeader = styled(TileHeader)`
  border-bottom: none;
`;

export const LargeTileContainer = styled(TileBasic)`
  position: relative;
  flex-direction: column;
  width: 954px;
  border: 1px solid var(--cogs-greyscale-grey4);
`;

export const LargeTilePreview = styled.div`
  display: flex;
  align-items: center;
  height: 576px;
  background-color: var(--cogs-white);
  border-radius: 4px;
  justify-content: center;

  .iframe-preview {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 8px 8px;
    height: 100%;
    width: 100%;

    iframe {
      border-radius: 4px;
      width: 100%;
      height: 100%;
    }
  }
`;

export const StyledTitle = styled(Title)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ImgPreview = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  padding: 0 8px 8px;

  & img {
    border-radius: 4px;
    width: 100%;
    height: 100%;
    object-fit: scale-down;
  }
`;

export const IconContainer = styled.div`
  display: flex;
  color: var(--cogs-greyscale-grey6);
`;
