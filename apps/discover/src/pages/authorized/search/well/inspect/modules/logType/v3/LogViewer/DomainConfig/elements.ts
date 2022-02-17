import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import Paper from 'components/paper/Paper';

export const Row = styled.div`
  display: flex;
  padding-bottom: 5px;
`;

export const Seperator = styled.div`
  padding: 4px;
`;

export const Panel = styled(Paper)`
  width: 300px;
  max-height: 400px;
  overflow: auto;
  padding: 6px 10px !important;
  position: absolute;
  margin-top: 5px;
  zindex: ${layers.MANAGE_COLUMNS};
`;
