import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

export const AssetItem = styled.div<{ outline?: boolean }>`
  border: 1px solid var(--cogs-greyscale-grey4);
  ${(props) =>
    props.outline && `border: 2px dashed ${Colors['decorative--green--200']};`};
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px 15px 0px 15px;
`;
