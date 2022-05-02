import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { CHART_BACKGROUND_COLOR } from 'components/Charts/constants';

export const ChartStickyElement = styled.svg`
  position: sticky;
  top: 0px;
  bottom: 0px;
  background: ${CHART_BACKGROUND_COLOR};
  z-index: ${layers.TABLE_HEADER};
`;
