import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

const Separator = styled((props) => (
  <div
    style={{
      backgroundColor: Colors['decorative--grayscale--300'],
      width: '2px',
      height: '16px',
      ...(props.style ?? {}),
    }}
  />
))``;

export default Separator;
