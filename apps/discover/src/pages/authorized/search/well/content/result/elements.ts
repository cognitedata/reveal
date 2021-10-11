import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const WellsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const HoverCellPadding = styled.div`
  padding-right: ${sizes.small};
`;

export const WelboreResultsTableWrapper = styled.div`
  & > * thead {
    display: none;
  }
  & > * td {
    padding: 3px 12px !important;
  }
  & > * td:first-child {
    width: 90px;
  }
  & > * tr:last-child {
    border-bottom: none;
  }
`;
