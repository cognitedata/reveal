import { Collapse } from '@cognite/cogs.js';
import styled from 'styled-components';

export const StyledCollapse = styled(Collapse)`
  .rc-collapse-content {
    padding: 0;
  }
  .rc-collapse-content-box {
    margin: 0;
    margin-bottom: 8px;
  }
  .rc-collapse-item {
    border: 1px solid white;
  }
`;
