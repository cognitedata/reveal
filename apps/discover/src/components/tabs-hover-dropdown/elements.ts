import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const TabsMenuWrapper = styled.div`
  transform: translateY(${sizes.extraSmall});
  pointer-events: none;
  opacity: 0;
  transition: 0.2s;
  visibility: hidden;
  transition-delay: 0.3s;
  padding: ${sizes.small};
  position: relative;
  top: -${sizes.small};
  right: -${sizes.small};
`;

export const TabsDropdownWrapper = styled.div`
  & > div {
    pointer-events: none;
  }

  & > * .tippy-box.cogs-dropdown {
    background: transparent;
  }

  &:hover {
    overflow: visible;

    & > div {
      pointer-events: initial;
    }

    ${TabsMenuWrapper} {
      visibility: visible;
      pointer-events: initial;
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
