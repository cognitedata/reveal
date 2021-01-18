import styled from 'styled-components/macro';

export const TilesContainer = styled.div`
  margin-bottom: 24px;
  & > h6 {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    padding-bottom: 8px;
    margin-bottom: 24px;
  }
  & .glider-slide {
    min-width: 298px;
    margin-right: 48px;
  }
  & .glider-next,
  & .glider-prev {
    top: 8%;
    color: var(--cogs-black);
  }
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
