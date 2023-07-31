import styled from 'styled-components/macro';

import { FlexRow, sizes } from 'styles/layout';

export const WellboreCasingsViewsWrapper = styled(FlexRow)`
  height: 100%;
  white-space: nowrap;
  overflow: auto;
  margin-right: -${sizes.normal}; // Reducing the margin of last stick chart.
`;
