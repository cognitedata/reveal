import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const WellsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const OverlayCellPadding = styled.div`
  padding-right: ${sizes.small};
`;

export const WelboreResultsTableWrapper = styled.div`
  & div[role='row'] > div:first-of-type {
    width: 60px;
  }
`;

export const SearchResultsContainer = styled.div`
  height: 100%;
  width: 100%;
`;
