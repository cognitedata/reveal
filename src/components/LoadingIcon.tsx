import React from 'react';
import { Icon, Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const MutedIcon = styled(Icon)`
  color: ${Colors['greyscale-grey5'].hex()};
`;

export default function LoadingIcon() {
  return <MutedIcon type="Loading" />;
}
