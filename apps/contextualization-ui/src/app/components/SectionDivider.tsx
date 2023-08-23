import styled from 'styled-components';

import { Divider } from '@cognite/cogs.js';

export const SectionDivider = () => (
  <SectionDividerWrapper>
    <Divider />
  </SectionDividerWrapper>
);

const SectionDividerWrapper = styled.div`
  /* To fill the padding of 12px */
  width: calc(100% + 24px);
  transform: translateX(-12px);
  // margin-bottom: 12px;
  // margin-top: 12px;
`;
