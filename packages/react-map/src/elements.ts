import styled from 'styled-components';

export const sizes = {
  extraSmall: '4px',
  small: '8px',
  normal: '16px',
  medium: '24px',
  large: '40px',
  extraLarge: '48px',
  huge: '80px',
};

//   z-index: ${layers.MAP};
export const MapContainer = styled.div`
  height: 100%;
  width: 100%;
  padding: 0;
  border: none;
  position: relative;
  border-left: 1px solid var(--cogs-color-strokes-default);

  & .mapboxgl-control-container {
    user-select: none;
    position: fixed;
    bottom: 0;
    width: 100vw;
    padding: 30px;

    .mapboxgl-ctrl-bottom-right {
      position: fixed;
      right: 0;
    }

    .mapboxgl-ctrl-bottom-left {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      align-items: flex-start;

      // the main logo
      .mapboxgl-ctrl .mapboxgl-ctrl-logo {
        display: none;
      }

      .mapboxgl-ctrl-minimap {
        border-radius: 8px;
        position: relative;
        &::after {
          content: '';
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          border-radius: 8px;
          box-shadow: 0 0 1px 1px black inset;
          opacity: 0.15;
          pointer-events: none;
        }
        // the minimap logo
        .mapboxgl-ctrl-logo {
          width: 90px;
          display: block;
          transform: scale(0.9);
          transform-origin: bottom left;
        }
      }
    }
  }
`;
// .mapboxgl-canvas-container canvas.mapboxgl-canvas {
//   position: relative !important;
// }

//   .map-hover-popup .mapboxgl-popup-content {
//     font-size: 12px;
//     line-height: 16px;
//     font-weight: 500;
//     padding: 12px 16px;
//     background: black;
//     color: white;
//     border-radius: 4px;
//   }

//   .map-hover-popup.mapboxgl-popup-anchor-top {
//     color: black !important;
//   }

//   .map-hover-popup .mapboxgl-popup-tip {
//     border-top-color: black !important;
//     border-bottom-color: black !important;
//   }

//   .map-layer-filter-menu .mapboxgl-popup-content {
//     padding: 0;
//     background: transparent;
//   }

//   .map-layer-filter-menu .mapboxgl-popup-tip {
//     display: none;
//   }

//   & .mapboxgl-ctrl-bottom-left {
//     display: flex;
//     flex-direction: row;
//     justify-content: flex-end;
//     align-items: flex-end;

//     .mapboxgl-ctrl-attrib-button {
//       display: none;
//     }
//     .mapboxgl-ctrl-minimap {
//       border-radius: 8px;
//       position: relative;

//       .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl-logo {
//         width: 90px;
//         display: block;
//         transform: scale(0.9);
//         transform-origin: bottom left;
//       }

//       &::after {
//         content: '';
//         position: absolute;
//         height: 100%;
//         width: 100%;
//         top: 0;
//         left: 0;
//         border-radius: 8px;
//         box-shadow: 0 0 1px 1px black inset;
//         opacity: 0.15;
//         pointer-events: none;
//       }
//     }
//   }

//   & .mapboxgl-ctrl-bottom-right .mapboxgl-ctrl-scale {
//     background-color: transparent;
//     font-size: 12px;
//     height: 20px;
//     border: 2px solid var(--cogs-text-color-secondary);
//     color: var(--cogs-text-color-secondary);
//     border-top: none;
//     padding: 0 6px;
//     border-radius: 0 0 4px 4px;
//   }

//   .mapboxgl-ctrl-attrib.mapboxgl-compact {
//     display: none;
//   }
// .mapbox-popup {
//   z-index: ${layers.MAP_TOP_BUTTONS};

//   .mapboxgl-popup-tip {
//     display: none;
//   }

//   .mapboxgl-popup-content {
//     background: transparent;
//     box-shadow: none !important;
//   }
// }

// .mapbox-popup-previewcard {
//   width: ${CARD_WIDTH}px;
//   max-width: ${CARD_WIDTH}px !important;

//   .mapboxgl-popup-content {
//     width: ${CARD_WIDTH}px;
//   }
// }
