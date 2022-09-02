import styled from 'styled-components/macro';

import { SubTitleText } from 'components/EmptyState/elements';
import { Center, sizes } from 'styles/layout';
import { DURATION } from 'styles/transition';

import {
  Container,
  ChartWrapper as CommonChartWrapper,
} from '../../../common/ChartV2/elements';
import {
  BodyColumn,
  BodyColumnMainHeader,
  EmptyStateWrapper,
} from '../../../common/Events/elements';
import {
  CHART_COLUMN_WIDTH,
  CHART_COLUMN_WIDTH_COLLAPSED,
} from '../../WellboreStickChart/constants';

export const ChartContainer = styled(BodyColumn)`
  transition: min-width ${DURATION.FAST};
`;

export const ChartTitle = styled(BodyColumnMainHeader)`
  align-self: center;
  margin: 12px;
  margin-bottom: -28px;
`;

export const ChartWrapper = styled.div`
  > ${Container} {
    border: none;

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

export const ChartEmptyStateWrapper = styled(EmptyStateWrapper)`
  ${SubTitleText} {
    width: ${CHART_COLUMN_WIDTH_COLLAPSED}px;
    padding: ${sizes.small};
  }
`;

export const ChartColumnText = styled(Center)`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  padding: ${sizes.small};
`;
