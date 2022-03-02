import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import Paper from 'components/paper/Paper';
import { FlexRow, sizes } from 'styles/layout';

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

export const NumberInputWrapper = styled(FlexRow)`
  margin-right: ${sizes.small};
  input {
    width: 100px;
  }
  max-width: 101px;
`;
