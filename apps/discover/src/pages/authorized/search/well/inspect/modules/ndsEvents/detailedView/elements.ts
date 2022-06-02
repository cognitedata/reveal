import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const ViewModeControlWrapper = styled.div`
  width: 100%;
  padding: ${sizes.normal};
  padding-bottom: 0;
`;

export const DetailedViewContent = styled.div`
  overflow: auto;
  height: 100%;
  padding: ${sizes.normal};
`;
