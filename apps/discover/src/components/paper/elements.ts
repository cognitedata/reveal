import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const PaperWrapper = styled.div`
  padding: ${sizes.normal};
  border: 1px solid var(--cogs-greyscale-grey5);
  border-radius: ${sizes.small};
  background-color: var(--cogs-white);
`;
