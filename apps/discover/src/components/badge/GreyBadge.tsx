import React from 'react';

import { Badge } from '@cognite/cogs.js';

export const GreyBadge: React.FC<{ text: string }> = ({ text }) => {
  return <Badge text={text} background="greyscale-grey2" />;
};
