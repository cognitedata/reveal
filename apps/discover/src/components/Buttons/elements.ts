import styled from 'styled-components/macro';

import { BUTTON_SPACING } from './constants';

export const MarginWrapper = styled.div`
  &:not(:last-child) {
    margin-right: ${BUTTON_SPACING};
  }
`;
