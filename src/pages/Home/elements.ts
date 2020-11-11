import styled from 'styled-components/macro';

export const OverviewContainer = styled.div`
  padding: 24px 48px;
`;
export const SmallTilesContainer = styled.div`
  margin-bottom: 48px;
`;

export const TilesContainer = styled.div`
  margin-bottom: 48px;
  & > h6 {
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    padding-bottom: 8px;
  }
`;
