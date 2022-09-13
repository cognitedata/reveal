import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const TrajectoryChartWrapper = styled.div`
  display: contents;
  > * .plotly-chart-detail-card {
    display: none !important;
  }
  > * .hovertext {
    display: initial !important;
  }
`;

export const TrajectoryCurveSelectorWrapper = styled.div`
  margin-top: -6px;
  z-index: ${layers.TABLE_HEADER};
  button {
    font-size: 12px;
  }
`;
