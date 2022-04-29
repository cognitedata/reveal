import styled from 'styled-components/macro';

export const TilesContainer = styled.div`
  margin-bottom: 24px;
  & > h6 {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    padding-bottom: 8px;
    margin-bottom: 24px;
  }

  & .glider-next,
  & .glider-prev {
    top: 8%;
    color: var(--cogs-black);
  }
`;

export const CustomLink = styled.a`
  width: inherit;
  text-align: left;
  color: var(--cogs-greyscale-grey10);
  text-decoration: none;
  &:hover {
    color: var(--cogs-greyscale-grey10);
  }
`;

export const CustomMenuItem = styled.div`
  width: inherit;
  text-align: left;
  margin-left: 5px;
`;

export const CustomMenuLink = styled.a`
  color: #262626;
  margin-left: 5px;
`;

export const OverviewContainer = styled.div`
  padding: 24px 48px;

  .subsuite-tile-menu {
    padding: 0;
    display: flex;
  }

  .grid-stack > .grid-stack-item > .grid-stack-item-content {
    overflow-y: hidden;
  }

  .grid-stack-item[gs-w='4'] {
    width: 100%;
  }
  .grid-stack-item[gs-w='3'] {
    width: 75%;
  }
  .grid-stack-item[gs-w='2'] {
    width: 50%;
  }
  .grid-stack-item[gs-w='1'] {
    width: 25%;
  }

  .grid-stack-item[gs-x='3'] {
    left: 75%;
  }
  .grid-stack-item[gs-x='2'] {
    left: 50%;
  }
  .grid-stack-item[gs-x='1'] {
    left: 25%;
  }
`;

export const Flex = styled.div`
  display: flex;
`;

export const SpaceBetween = styled(Flex)`
  justify-content: space-between;
`;

export const NoItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 62px;
  .cogs-graphic {
    margin-bottom: 16px;
  }
`;

export const EllipsisText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
