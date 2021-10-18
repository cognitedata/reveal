import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { FlexColumn, FlexRow, sizes } from 'styles/layout';

export const MeasurementsWrapper = styled(FlexColumn)`
  height: 100%;
  gap: ${sizes.normal};
`;

export const MeasurementsTopBar = styled(FlexRow)`
  position: sticky;
  top: 0;
  z-index: ${layers.DROPDOWN_SELECT};
`;
