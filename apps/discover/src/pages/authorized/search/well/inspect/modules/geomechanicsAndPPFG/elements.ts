import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { FlexRow, sizes } from 'styles/layout';

export const TopContentWrapper = styled(FlexRow)`
  position: sticky;
  top: 0;
  z-index: ${layers.FILTER_BOX};

  & > * {
    margin-left: ${sizes.extraSmall};
  }
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: ${sizes.extraSmall};
  justify-content: flex-end;
  margin-bottom: ${sizes.normal};
`;
