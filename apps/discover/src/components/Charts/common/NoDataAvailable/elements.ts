import styled from 'styled-components/macro';

import { FlexColumn } from 'styles/layout';

export const NoDataContainer = styled(FlexColumn)`
  justify-content: center;
  align-items: center;
  height: calc(100% - 120px);
`;

export const EmptyStateContainer = styled.div`
  margin-top: 10px;
  h6 {
    span {
      margin-left: -26px;
    }
  }
`;
