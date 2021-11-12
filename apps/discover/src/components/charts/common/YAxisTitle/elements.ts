import styled from 'styled-components/macro';

import { AxisLabel } from 'components/charts/elements';
import { sizes } from 'styles/layout';

export const AxisTitleContainer = styled.div`
  margin: auto;
`;

export const AxisTitle = styled(AxisLabel)`
  transform: rotate(270deg);
  white-space: nowrap;
  margin: 0px -${sizes.normal} ${sizes.normal} -${sizes.normal};
`;
