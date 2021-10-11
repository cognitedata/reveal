import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { FlexRow } from 'styles/layout';

export const ContainerRow = styled(FlexRow)`
  flex-wrap: nowrap;

  max-height: 100%;
  height: 100%;
`;
export const FilterColumn = styled.div`
  width: 30%;
  margin-right: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  overflow: auto;
  height: 100%;
  max-height: 100%;

  & > .rc-collapse {
    border: none;
  }
`;
export const ChartColumn = styled.div`
  width: 70%;
`;

export const ChartHolder = styled.div`
  height: 100%;
  & > .js-plotly-plot {
    height: 100%;
    width: 100%;
  }
`;

export const UnitSelectorWrapper = styled.div`
  position: absolute;
  z-index: ${layers.DROPDOWN_SELECT};
  border: 1px solid #d9d9d9;
  padding: 5px;
  border-radius: 5px;
`;
