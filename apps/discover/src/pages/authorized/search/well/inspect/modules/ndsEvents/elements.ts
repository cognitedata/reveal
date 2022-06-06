import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexRow, sizes } from 'styles/layout';

export const FiltersBar = styled(FlexRow)`
  padding: ${sizes.normal};
  padding-top: 0;
  padding-left: 0;
  z-index: ${layers.FILTER};

  & > *:not(:last-child) {
    margin-right: ${sizes.normal};
  }
`;

export const WellboreTableWrapper = styled.div`
  max-height: 75vh;
  overflow: auto;
`;
