import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Icon } from '@cognite/cogs.js';

import {
  FlexRow,
  FlexColumn,
  FlexAlignJustifyContent,
  sizes,
} from 'styles/layout';

export const SearchHistoryRow = styled(FlexRow)`
  width: 100%;
  max-width: 280px;
  border-radius: 6px;
  cursor: pointer;
  padding: 8px;
  &:hover {
    background-color: var(--cogs-greyscale-grey2);
    .cogs-icon-History {
      color: var(--cogs-greyscale-grey10);
    }
  }
`;

export const customStyles = {
  option: (styles: any) => {
    return {
      ...styles,
      backgroundColor: 'white',
      color: '#595959',
      ':hover': {
        ...styles[':hover'],
        backgroundColor: '#f5f5f5',
      },
      padding: 0,
    };
  },
};

export const SearchPhrase = styled.div`
  color: var(--cogs-text-color-secondary);
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
`;

export const SearchContainer = styled.div`
  width: 90%;
`;

export const Filters = styled.div`
  color: var(--cogs-greyscale-grey6);
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SearchBarTextWrapper = styled.div`
  margin-left: 24px;
`;

export const SearchBarIconWrapper = styled(Icon).attrs({
  style: { position: 'absolute', left: '8px' },
})``;

export const IconWrapper = styled(FlexColumn)`
  align-items: flex-end;
  justify-content: center;
  color: var(--cogs-greyscale-grey4);

  .cogs-icon-History {
    margin-right: 0px !important;
  }
`;

export const SearchHistoryContainer = styled(FlexAlignJustifyContent)`
  z-index: ${layers.SEARCH};
  width: 100%;

  .tippy-box {
    max-width: none !important; // Overwrite tippy's max width for SyntaxHelper
  }

  & > .cogs-select {
    margin-left: ${sizes.small};
    width: 100%;
    max-width: 230px;
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
      padding: 0px !important;
      margin-top: 0px !important;
      margin-bottom: 0px !important;
      border-radius: ${sizes.small}!important;
      & > .cogs-select__menu-list {
        & > .cogs-select__option:first-child {
          pointer-events: none !important;
          cursor: none !important;
          border-radius: 0px;
          border-bottom: 1px solid;
          border-color: var(--cogs-greyscale-grey4);
          padding-left: ${sizes.normal}!important;
          padding-right: ${sizes.normal}!important;
          padding-bottom: ${sizes.normal}!important;
          padding-top: ${sizes.normal}!important;
        }
        & > .cogs-select__group {
          margin: 0px 0px ${sizes.small} 0px !important;
          padding-bottom: 0px !important;
          & > .cogs-select__group-heading {
            padding: 0px ${sizes.small} !important;
            margin: ${sizes.small}!important;
            & > .group-labels {
              text-transform: none !important;
              font-style: normal;
              font-weight: 400;
              font-size: 12px;
            }
            & * .cogs-badge {
              display: none;
            }
          }
          & > div {
            margin-left: ${sizes.small}!important;
            margin-right: ${sizes.small}!important;
          }
        }
      }
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
