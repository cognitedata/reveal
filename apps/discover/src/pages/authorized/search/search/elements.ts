import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexAlignJustifyContent, FlexRow, sizes } from 'styles/layout';

export const SearchMenuContainer = styled(FlexRow)`
  border-right: 1px solid var(--cogs-color-strokes-default);
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  height: 68px;
  width: 100%;
  padding-right: 8px;
  padding-left: 8px;
`;

export const SearchTypesContainer = styled(FlexAlignJustifyContent)`
  z-index: ${layers.SEARCH};
  width: 100%;

  .tippy-box {
    max-width: none !important; // Overwrite tippy's max width for SyntaxHelper
  }

  & > .cogs-select {
    margin-left: ${sizes.normal};
    width: 100%;
    max-width: 200px;
    height: 36px;
    cursor: pointer;
    & > * .cogs-select__placeholder {
      cursor: text;
      font-weight: 400;
    }
    & > * .cogs-select__single-value {
      cursor: text;
      color: var(--cogs-greyscale-grey9);
      line-height: unset;
    }
    & > .cogs-select__control {
      border-radius: 5px;
      transition: 500ms;
      .cogs-select__indicators {
        .cogs-select__clear-indicator {
          color: var(--cogs-greyscale-grey6);
        }
        .cogs-select__clear-indicator:hover {
          color: var(--cogs-midblue-4);
        }
      }
    }
    & > .cogs-select__menu {
      width: 290px;
      outline: none;
      background-color: white;
      border-radius: 8px;
    }
    & > * .cogs-select__single-value {
      cursor: text;
    }
    &:hover .cogs-select__control {
      background-color: var(--cogs-white);
      border: 2px solid var(--cogs-midblue-4) !important;
    }
    &:hover .cogs-select__control.cogs-select__control--is-focused {
      border: 2px solid var(--cogs-primary) !important;
    }
  }
`;

export const MapToolsContainer = styled(FlexAlignJustifyContent)`
  margin: 0 20px;
`;
