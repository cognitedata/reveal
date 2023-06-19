import React from 'react';
import { Icon, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const MutedIcon = styled(Icon)`
  color: ${Colors['decorative--grayscale--500']};
`;

export default function LoadingIcon() {
  return <MutedIcon type="Loader" />;
}
