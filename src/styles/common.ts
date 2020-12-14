import styled from 'styled-components/macro';

export const TilesContainer = styled.div`
  margin-bottom: 48px;
  & > h6 {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    padding-bottom: 8px;
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
