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
