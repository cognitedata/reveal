import styled from 'styled-components/macro';

export const TrajectoryChartWrapper = styled.div`
  display: contents;
  > * .plotly-chart-detail-card {
    display: none !important;
  }
  > * .hovertext {
    display: initial !important;
  }
`;
