import React from 'react';

import styled from 'styled-components';

import { Icon, Colors } from '@cognite/cogs.js';

const MutedIcon = styled(Icon)`
  color: ${Colors['decorative--grayscale--500']};
`;

export default function LoadingIcon() {
  return <MutedIcon type="Loader" />;
}
