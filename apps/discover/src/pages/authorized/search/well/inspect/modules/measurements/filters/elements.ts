import styled from 'styled-components/macro';

import {
  ChildrenContainer,
  SubtitleContainer,
} from 'components/emptyState/elements';
import { Flex, FlexColumn, sizes } from 'styles/layout';

export const DropdownWrapper = styled(Flex)`
  min-width: 256px;
  .cogs-select {
    width: 100%;
    > * .cogs-select__menu {
      padding: ${sizes.small};
      > * .cogs-menu-divider {
        width: 100%;
      }
    }
    > * .cogs-select__control--menu-is-open {
      border: 2px solid var(--cogs-midblue-4) !important;
    }
    .cogs-select__clear-indicator {
      display: none;
    }
    > * .cogs-select__menu-notice--no-options {
      > * h6 {
        display: none;
      }
      > * ${ChildrenContainer} {
        display: none;
      }
      > * ${SubtitleContainer} {
        padding: 0;
      }
      height: 225px;
    }
  }
  margin-left: ${sizes.small};
`;

export const UnitSelectorWrapper = styled(Flex)`
  margin-left: ${sizes.small};
  > * .cogs-menu {
    padding: ${sizes.small};
  }
  > * #mainMenu {
    width: 220px;
  }
  > * #subMenu {
    width: 156px;
  }
  div {
    div {
      margin-right: 0 !important;
    }
  }
`;

export const UnitCategoryBody = styled(FlexColumn)`
  width: 100%;
`;

export const UnitCategoryHeader = styled(Flex)`
  font-weight: 500;
  line-height: var(--cogs-t6-line-height);
  color: var(--cogs-greyscale-grey7);
`;

export const UnitCategoryValue = styled(Flex)`
  font-size: var(--cogs-detail-font-size);
  line-height: var(--cogs-detail-line-height);
  letter-spacing: var(--cogs-detail-letter-spacing);
  color: var(--cogs-greyscale-grey6);
`;
