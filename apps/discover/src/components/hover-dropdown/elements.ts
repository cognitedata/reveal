import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { sizes } from 'styles/layout';

export const MenuWrapper = styled.div`
  transform: translateY(${sizes.extraSmall});
  pointer-events: none;
  opacity: 0;
  transition: 0.2s;
  visibility: hidden;
  transition-delay: 0.3s;
  position: absolute;
  right: 0;
  padding: ${sizes.small};
`;

export const DropdownWrapper = styled.div`
  position: inherit;
  transition-delay: 0.3s;

  & > div {
    pointer-events: none;
  }

  &:hover {
    overflow: visible;

    & > div {
      pointer-events: initial;
    }

    ${MenuWrapper} {
      z-index: ${layers.DROPDOWN_SELECT};
      visibility: visible;
      pointer-events: initial;
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
