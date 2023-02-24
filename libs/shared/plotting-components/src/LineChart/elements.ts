import styled from 'styled-components/macro';
import {
  HOVER_MARKER_SIZE,
  LABEL_COLOR,
  SUBTITLE_COLOR,
  TICK_COLOR,
  TITLE_COLOR,
} from './constants';

export const LineChartWrapper = styled.div`
  font-family: Inter;
  padding: 8px;
  border-radius: 8px;
`;

export const PlotWrapper = styled.div`
  > * .main-svg {
    background: transparent !important;
  }

  & > div {
    height: 100%;
    width: 100%;
    display: inline-block;
  }

  > * .modebar-container {
    display: none;
  }

  > * .xtick,
  .ytick {
    text {
      fill: ${LABEL_COLOR} !important;
      font-family: Inter !important;
      font-weight: 400 !important;
      font-size: 11px !important;
      line-height: 16px !important;
      font-feature-settings: 'ss04' on !important;
    }
  }

  > * .xtick:first-child {
    display: none;
  }

  > * .crisp {
    stroke: ${TICK_COLOR} !important;
    ${(props: { showticks: boolean }) =>
      !props.showticks &&
      `
      display: none;
    `}
  }

  > * .hovertext {
    display: none;
  }

  > * .hoverlayer {
    .legend {
      display: none;
    }
  }

  > * .draglayer {
    cursor: auto !important;
  }

  > * .xy {
    .cursor-w-resize,
    .cursor-e-resize,
    .cursor-ew-resize,
    .cursor-ns-resize,
    .cursor-n-resize,
    .cursor-s-resize {
      display: none;
    }
  }

  > * .xtitle,
  .ytitle {
    fill: ${LABEL_COLOR} !important;
    font-family: Inter !important;
    font-weight: 500 !important;
    font-size: 12px !important;
    line-height: 16px !important;
    font-feature-settings: 'ss04' on !important;
  }
`;

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
`;

export const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: ${TITLE_COLOR};
`;

export const ChartSubtitle = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: ${SUBTITLE_COLOR};
`;

export const TooltipWrapper = styled.div`
  position: absolute;
  transform: translateY(-50%);
  transition: opacity 0.4s ease;
`;

export const TooltipContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-sizing: border-box;
  padding: 8px;
  gap: 8px;
  box-shadow: 0px 8px 16px 4px rgba(0, 0, 0, 0.04),
    0px 2px 12px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
`;

export const TooltipDetailWrapper = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 12px;
  line-height: 16px;
  padding: 8px 12px;
  border-radius: 8px;
`;

export const TooltipDetailLabel = styled.div`
  font-weight: 500;
  margin-right: 4px;
`;

export const TooltipDetailValue = styled.div`
  font-weight: 400;
`;

export const PlotMarker = styled.div`
  position: absolute;
  width: ${HOVER_MARKER_SIZE}px;
  height: ${HOVER_MARKER_SIZE}px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
`;

export const LegendWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  margin-top: 6px;
  gap: 16px;
  flex-wrap: wrap;
`;

export const LegendItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-top: 3px;

  border-right: 2px solid #d9d9d9;
  padding-right: 16px;
  :last-child {
    border-right: none;
    padding-right: 0;
  }
`;

export const LegendItemIcon = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: -4px;
  margin-right: 8px;
`;

export const LegendItemLabel = styled.div`
  font-weight: 500;
  font-size: 12px;
`;
