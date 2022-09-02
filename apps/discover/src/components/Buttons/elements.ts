import styled from 'styled-components/macro';

import { BUTTON_SPACING } from './constants';

export const MarginWrapper = styled.div`
  &:not(:last-child) {
    margin-right: ${BUTTON_SPACING};
  }
`;

export const IconWrapper = styled.div`
  ${(props: { $disabled?: boolean }) =>
    props.$disabled
      ? `
      color: var(--cogs-text-icon--interactive--disabled);
      cursor: not-allowed;
    `
      : `
      cursor: pointer;
  `}
`;
