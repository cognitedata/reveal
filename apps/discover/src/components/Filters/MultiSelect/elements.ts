import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';

import { FlexAlignItems, FlexColumn, sizes } from 'styles/layout';

import { MultiSelectContainerProps } from './types';

export const MultiSelectTitle = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${sizes.small};
  color: var(--cogs-greyscale-grey9);
  font-weight: 500;
`;

export const MultiSelectContainer = styled.div`
  width: 100%;
  .cogs-menu-divider {
    width: calc(100% + 8px);
    align-self: center;
  }
  .cogs-select--title {
    color: var(--cogs-text-primary);
  }
  .cogs-select__control {
    cursor: pointer;
    ${(props: MultiSelectContainerProps) =>
      props.outlined &&
      `
    border: 2px solid var(--cogs-greyscale-grey4) !important;
    background-color: var(--cogs-white) !important;
    `}
    :hover {
      background: var(--cogs-input-hover-background);
      border: var(--cogs-input-hover-border) !important;
    }
  }
  .cogs-select__option--is-disabled {
    color: var(--cogs-greyscale-grey6) !important;
    background-color: white !important;
    &:hover {
      background-color: inherit;
      cursor: default !important;
    }
  }
  .cogs-select__option {
    color: var(--cogs-text-primary);
  }
  .cogs-select__option:hover {
    cursor: pointer;
  }
  ${(props: MultiSelectContainerProps) =>
    props.hideClearIndicator &&
    `
    .cogs-select__clear-indicator {
      display: none;
    }
  `}
`;

export const MultiSelectItemContainer = styled(FlexAlignItems)`
  justify-content: space-between;
  flex: 1;
`;

export const MultiSelectFacetText = styled(Body)`
  max-width: 190px;
  word-wrap: break-word;
`;

export const DisplayValue = styled.span`
  margin-left: ${sizes.extraSmall};
  margin-right: ${sizes.extraSmall};
  overflow: hidden;
  text-overflow: ellipsis;
`;
