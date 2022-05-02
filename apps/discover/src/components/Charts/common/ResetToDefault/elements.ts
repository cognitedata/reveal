import styled from 'styled-components/macro';

import { FlexColumn } from 'styles/layout';

export const ResetToDefaultContainer = styled(FlexColumn)`
  justify-content: center;
  align-items: center;
  height: calc(100% - 120px);
`;

export const EmptyStateContainer = styled.div`
  margin-bottom: 40px;
`;
