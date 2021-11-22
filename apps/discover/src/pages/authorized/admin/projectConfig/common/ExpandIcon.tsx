import React from 'react';

import { CollapsePanelProps } from '@cognite/cogs.js';

import { ConfigIcon } from '../elements';

export const ExpandIcon: React.FC<CollapsePanelProps> = ({ isActive }) => {
  return <ConfigIcon type="ChevronDownMicro" active={`${isActive}`} />; // note: active is string?!?!
};
