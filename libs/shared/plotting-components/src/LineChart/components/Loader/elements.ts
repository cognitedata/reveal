import styled from 'styled-components/macro';

import { Colors } from '@cognite/cogs.js';

export const LoaderWrapper = styled.div`
  width: 100%;
  justify-content: center;
  display: flex;
  align-items: center;
  color: ${Colors['decorative--grayscale--400']};

  svg {
    width: 100%;
    height: 100%;
  }
`;
