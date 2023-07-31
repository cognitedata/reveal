import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { InlineFlex } from 'styles/layout';

export const SelectorRow = styled(InlineFlex)`
  width: 100%;
`;

export const SelectorWrapper = styled.div`
  z-index: ${layers.FILTER_BOX};
  border: 1px solid #d9d9d9;
  padding: 5px;
  border-radius: 5px;
`;
