import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { InlineFlex } from 'styles/layout';

export const SelectorRow = styled(InlineFlex)`
  width: 100%;
`;

export const SelectorWrapper = styled.div`
  z-index: ${layers.DROPDOWN_SELECT};
  border: 1px solid #d9d9d9;
  padding: 5px;
  border-radius: 5px;
`;

export const ChartHolder = styled.div`
  height: calc(100% - 50px);
  & > .js-plotly-plot {
    height: 100%;
    width: 100%;
  }
`;
