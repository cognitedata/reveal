import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

const FooterWrapper = styled.div`
  padding: ${sizes.small};
  border-top: 1px solid var(--cogs-greyscale-grey3);
`;

export const FooterRegion = () => (
  <FooterWrapper>
    After selecting a new region be sure to narrow your search by adding a
    related field/block
  </FooterWrapper>
);
export const FooterField = () => (
  <FooterWrapper>
    Options are available based on your previous selections
  </FooterWrapper>
);
