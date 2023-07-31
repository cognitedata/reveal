import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexRow, sizes } from 'styles/layout';

export const FiltersBar = styled(FlexRow)`
  padding-bottom: ${sizes.small};
  z-index: ${layers.FILTER};

  & > *:not(:last-child) {
    margin-right: ${sizes.normal};
    margin-bottom: 8px;
  }
  flex-wrap: wrap;
`;

export const WellboreTableWrapper = styled.div`
  max-height: 75vh;
  overflow: auto;
`;
