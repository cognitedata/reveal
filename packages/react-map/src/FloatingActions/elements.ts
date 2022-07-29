import styled from 'styled-components';

import { sizes } from '../elements';

export const FloatingActionsWrapper = styled.div`
  padding: ${sizes.extraSmall};
  background-color: var(--cogs-white);
  border-radius: ${sizes.small};
  display: flex;
  flex-direction: row;
  z-index: ${(props: { zIndex: number }) => props.zIndex};

  .cogs-btn-primary {
    margin-right: ${sizes.extraSmall};
  }
`;

export const MarginWrapper = styled.div`
  &:not(:last-child) {
    margin-right: ${sizes.small};
  }
`;
