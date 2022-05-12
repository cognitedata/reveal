import styled from 'styled-components/macro';

import mainPalette from 'styles/default.palette';

const borderColor = '#333';
const titleColor = '#555';

export const LogViewerWrapper = styled.div`
  height: 100%;
  position: relative;
  flex: 1 1 0%;
  flex-direction: row;
  display: flex;
  pointer-events: none;
  overflow: hidden;
  border: 1px solid ${borderColor};
  box-sizing: border-box;

  & > .overlay {
    pointer-events: auto;
    min-height: 0;
    position: absolute;
  }

  & > .track {
    border-right: 1px solid ${borderColor};
    overflow: hidden;
    display: flex;
    flex-direction: column;

    & > .track-title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      overflow: hidden;
      color: ${titleColor};
      border-bottom: 1px solid ${borderColor};
      pointer-events: auto;
      cursor: help;
      height: 28px !important;
      font-size: 14px !important;
    }

    & > .track-legend {
      pointer-events: all;
      overflow: hidden;
      border-bottom: 1px solid ${borderColor};

      & > svg {
        & > .svg-legend {
          transform: translateY(7px);
          & > .legend-row line {
            stroke-width: 1.2 !important;
          }
          & > .legend-row .legend-label {
            font-size: 12px;
          }
          & > .legend-row .legend-domain {
            font-size: 12px;
            transform: translateY(-10px);
          }
        }
      }
    }

    & > .track-container {
      flex: 1 1 auto;
      overflow: hidden;

      & > .scale-track {
        stroke: ${titleColor};

        & > .major-tick {
          & > .label-bg {
            stroke: ${mainPalette.white};
            fill: ${mainPalette.white};
          }
        }
      }
    }

    :last-child {
      border-right: none;
    }
  }
`;
