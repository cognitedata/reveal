import styled from 'styled-components/macro';

import {
  BodyColumnMainHeader,
  DepthMeasurementScale,
  EmptyStateWrapper,
} from '../../common/Events/elements';

export const ChartTitle = styled(BodyColumnMainHeader)`
  align-self: center;
  margin: 12px;
  margin-bottom: -28px;
`;

export const ChartWrapper = styled.div`
  > .plotly-chart-container {
    border: none;

    > .plotly-chart-wrapper {
      background-color: transparent;
      margin-top: -14px;
      margin-left: -50px;
      margin-right: -10px;
    }
  }
  > * .ytitle {
    display: none;
  }
  & > div {
    width: 320px;
  }
`;

export const ChartEmptyStateWrapper = styled(EmptyStateWrapper)`
  max-width: none;
  width: 100%;
`;

export const DepthMeasurementScaleWrapper = styled(DepthMeasurementScale)`
  align-content: center;
`;
