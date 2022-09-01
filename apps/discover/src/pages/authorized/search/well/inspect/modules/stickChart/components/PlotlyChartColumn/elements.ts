import styled from 'styled-components/macro';

import { SubTitleText } from 'components/EmptyState/elements';
import { sizes } from 'styles/layout';

import {
  BodyColumnMainHeader,
  EmptyStateWrapper,
} from '../../../common/Events/elements';
import { CHART_COLUMN_WIDTH } from '../../WellboreStickChart/constants';

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
    width: calc(${CHART_COLUMN_WIDTH}px - ${sizes.normal});
  }
`;

export const ChartEmptyStateWrapper = styled(EmptyStateWrapper)`
  ${SubTitleText} {
    width: ${CHART_COLUMN_WIDTH}px;
    padding: ${sizes.small};
  }
`;
