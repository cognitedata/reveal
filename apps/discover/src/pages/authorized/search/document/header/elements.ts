import styled from 'styled-components/macro';

import { FlexRow, sizes } from 'styles/layout';

export const TagRow = styled(FlexRow)`
  flex-wrap: wrap;
  margin-top: 16px;
`;

export const TagWrapper = styled.div`
  margin-right: ${sizes.small};
  margin-bottom: ${sizes.small};
`;
