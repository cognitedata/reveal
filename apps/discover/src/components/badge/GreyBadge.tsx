import React from 'react';

import { Badge } from '@cognite/cogs.js';

export const GreyBadge: React.FC<{
  text: string;
  color?: string;
  borderRadius?: string;
  padding?: string;
}> = ({ text, color, borderRadius, padding }) => {
  return (
    <Badge
      text={text}
      background={color || 'greyscale-grey2'}
      style={{ borderRadius, padding }}
    />
  );
};
