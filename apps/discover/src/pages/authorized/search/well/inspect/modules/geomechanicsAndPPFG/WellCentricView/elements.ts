import styled from 'styled-components/macro';

import { FlexColumn, sizes } from 'styles/layout';

export const WellCentricViewWrapper = styled(FlexColumn)`
  overflow-y: scroll;
  gap: ${sizes.normal};
`;
