import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { Flex } from 'styles/layout';

export const DropdownWrapper = styled(Flex)`
  width: 150px;
  > * .cogs-select__placeholder {
    display: none;
  }
  > * .cogs-select__menu {
    z-index: ${layers.DROPDOWN_SELECT};
  }
  > * .cogs-select__control--menu-is-open {
    border: 2px solid var(--cogs-midblue-4) !important;
  }
`;

export const DateRangeButtonWrapper = styled(Flex)`
  > * button {
    justify-content: start;
    width: 150px;
    font-weight: 600;
    line-height: var(--cogs-t6-line-height);
    border: 2px solid transparent !important;
    .cogs-icon {
      margin-left: auto;
      color: var(--cogs-greyscale-grey6);
    }
    ${(props: { active: boolean }) =>
      props.active
        ? 'background-color: white;border-color: var(--cogs-midblue-4) !important;'
        : ''};
  }
  > * button:hover {
    border-color: var(--cogs-midblue-4) !important;
    box-sizing: border-box;
    background-color: ${(props: { active: boolean }) =>
      props.active ? 'white;' : 'var(--cogs-bg-control--secondary)'};
  }
`;
