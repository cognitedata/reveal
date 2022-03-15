import styled from 'styled-components/macro';

import { AxisLabel } from 'components/charts/elements';
import { FlexColumn, sizes } from 'styles/layout';

export const AxisTitleContainer = styled(FlexColumn)`
  position: relative;
  text-align: center;
`;

export const AxisTitle = styled(AxisLabel)`
  margin-top: ${sizes.small};
`;
