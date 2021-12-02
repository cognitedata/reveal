import styled from 'styled-components/macro';

import { WelboreResultsTableWrapper } from 'pages/authorized/search/well/content/result/elements';
import { FlexColumn } from 'styles/layout';

export const FavoriteWellWrapper = styled(FlexColumn)`
  height: 100%;

  & > div[data-testid='table-bulk-actions'] {
    position: sticky;
    width: calc(100% - 32px);
  }

  & > table[data-testid='well-result-table'] {
    table-layout: inherit !important;
  }
`;

export const FavoriteWelboreResultsTableWrapper = styled(
  WelboreResultsTableWrapper
)``;

export const RemoveFavoriteLabel = styled.span`
  color: var(--cogs-red-2);
  font-weight: 500;
  text-align: center;
  min-width: 120px;
`;
