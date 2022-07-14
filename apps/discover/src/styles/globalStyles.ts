import { createGlobalStyle } from 'styled-components/macro';
import '@fontsource/inter';
import layers from 'utils/zindex';

import { CARD_WIDTH } from 'components/Card/PreviewCard/constants';

import { sizes } from './layout';

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: Inter;
    font-weight: normal;
    font-style: normal;
  }

  #root {
    min-height: 100%;
  }

  #root * {
    font-family: 'Inter';
    font-feature-settings: 'ss04' on;
  }

  *:focus {
    outline: none;
  }

  .Mui-selected > .MuiTab-wrapper {
    color: var(--cogs-greyscale-grey9) !important;
  }

  .MuiSnackbarContent-message {
    font-size: 14px;
    font-weight: 300;
  }

  p[class^="Mui"],
  span[class^="Mui"],
  div[class^="Mui"] {
    font-size: 14px;
  }

  /* Cogs.js Search bar */

  // When hiding the dropdown icon on Cogs.js search, some weird divider appears
  .cogs-select__indicator-separator {
    display: none;
  }

  // Search input state (focus and background change) management
  .cogs-select__control {
    && {
      border: 2px solid transparent !important;
      &:focus-within {
        background-color: white ;
        border: 2px solid var(--cogs-primary) !important;
        transition: all 300ms;
      }
    }
  }

  // Search input text
  .cogs-select__single-value {
    color: black;
    font-weight: 400;
  }

.cogs-table th,
.cogs-table td {
  background: var(--cogs-white);
}

  // Remove padding from X (makes the search jump)
  .cogs-select__indicators .cogs-select__clear-indicator {
    padding: 0;
    padding-right: 8px;

    // Remove line next to X
    &::after {
      background-color: transparent;
    }
  }

  input[id^='react-select-'] {
    opacity: 1 !important;
  }

  .admin-navigation {
    padding-left: 0px !important;
  }

  /* Cogs modal */

  .cogs-modal-content {
    border-radius: 8px;
    height:100%
  }

  .cogs-modal {
    padding: 0px !important;
  }

  .cogs-modal-header {
    font-size: 16px !important;
    padding: 18px 32px !important;
    font-weight: 600 !important;
  }

  .cogs-modal-close {
    top: 25px !important;
    right: 25px !important;

    svg {
      height: 16px;
      width: 16px;
    }
  }

  /* Cogs hover preview */

  .hp-preview {
    z-index: ${layers.MAXIMUM};
    max-height: 80vh;
    overflow: scroll;
    //box-shadow: 0 14px 24px rgba(0, 0, 0, 0.1), 0 6px 15px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04);
    border-radius: 4px;

    .hp-cell {
      border-bottom: 0 !important;
      border-color: var(--cogs-color-strokes-default) !important;
    }

    .hp-header {
      border: none !important;
    }

    .hp-cell-title {
      margin-bottom: ${sizes.small};
    }
  }

  .hp-displayicon {
    color: var(--cogs-greyscale-grey8);
    cursor: pointer;
  }

  /* Cogs menu */

  .cogs-menu {
    color: var(--cogs-text-color);
  }

  /* Cogs Toast */

  .cogs-toast .Toastify__close-button {
    display: none;
  }

  /* Cogs Input */

  .cogs-drawer .drawer-content-wrapper .cogs-drawer-footer {
    padding: 0;
  }

  .ReactQueryDevtools > button {
    opacity: 0.2;
    transition: opacity 0.3s
  }

  .ReactQueryDevtools:hover > button {
    opacity: 1;
  }

  .map-hover-popup .mapboxgl-popup-content {
    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
    padding: 12px 16px;
    background: black;
    color: white;
    border-radius: 4px;
  }

  .map-hover-popup.mapboxgl-popup-anchor-top {
    color: black !important;
  }

  .map-hover-popup .mapboxgl-popup-tip {
    border-top-color: black !important;
    border-bottom-color: black !important;
  }

  .map-layer-filter-menu .mapboxgl-popup-content {
    padding: 0;
    background: transparent;
  }

  .map-layer-filter-menu .mapboxgl-popup-tip {
    display: none;
  }

  .mapbox-popup {
    z-index: ${layers.MAP_TOP_BUTTONS};

    .mapboxgl-popup-tip {
      display: none;
    }

    .mapboxgl-popup-content {
      background: transparent;
      box-shadow: none !important;
    }
  }

  .mapbox-popup-previewcard {
    width: ${CARD_WIDTH}px;
    max-width: ${CARD_WIDTH}px !important;

    .mapboxgl-popup-content {
      width: ${CARD_WIDTH}px;
    }
  }

`;
