import styled from 'styled-components/macro';

import { Input, Menu } from '@cognite/cogs.js';

import { sizes } from 'styles/layout';

export const CustomMenu = styled(Menu)`
  max-height: 70vh;
  overflow: auto;
  margin-top: ${sizes.small};
  border-radius: ${sizes.small};
  width: 196px;
  border: 1px solid var(--cogs-white);

  & > * .input-wrapper {
    margin: ${sizes.extraSmall} ${sizes.small} ${sizes.small} ${sizes.small};
    width: 100%;
  }
  & > * input {
    width: 100%;
    border-radius: 6px;
  }
  & > * .cogs-icon {
    color: var(--cogs-greyscale-grey6);
  }

  & > * .cogs-menu-header {
    color: var(--cogs-greyscale-grey6);
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & > * .cogs-checkbox {
    text-align: start;
  }

  & > * .cogs-menu {
    padding: 4px 0px !important;
  }

  & > div[title='flex-menu-container'] {
    padding: 0px ${sizes.small} !important;
  }

  & > * .cogs-menu-header {
    padding: ${sizes.small};
  }

  & > * .cogs-menu-divider {
    height: 1px;
    color: var(--cogs-greyscale-grey4);
  }

  & > * .cogs-checkbox {
    width: inherit;

    & > .item-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

export const InputContainer = styled(Input)``;
