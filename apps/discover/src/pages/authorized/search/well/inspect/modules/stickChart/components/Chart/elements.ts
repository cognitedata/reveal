import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

import {
  Container,
  ChartWrapper as CommonChartWrapper,
} from '../../../common/ChartV2/elements';
import {
  BodyColumnBody,
  BodyColumnMainHeader,
} from '../../../common/Events/elements';
import { CHART_COLUMN_WIDTH } from '../../WellboreStickChart/constants';

export const ChartWrapper = styled(BodyColumnBody)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const ChartHeader = styled(BodyColumnMainHeader)`
  position: absolute;
  top: 0;
  margin: 12px;
  margin-bottom: -28px;
`;

export const ChartContentWrapper = styled.div`
  > ${Container} {
    border: none;
    position: absolute;
    top: 0;
    left: 0;

    > ${CommonChartWrapper} {
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
