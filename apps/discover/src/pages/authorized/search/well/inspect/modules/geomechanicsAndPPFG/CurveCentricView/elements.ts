import styled from 'styled-components/macro';

import { FlexColumn, sizes } from 'styles/layout';

export const CurveCentricViewWrapper = styled(FlexColumn)`
  gap: ${sizes.small};
  overflow: auto;
  flex-flow: row wrap;
`;
