import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const BulkActionsWrapper = styled.div`
  position: relative;
  z-index: ${layers.BULK_ACTION};
  > * {
    &:first-child {
      margin: 0;
      width: 100%;
    }
  }
`;
