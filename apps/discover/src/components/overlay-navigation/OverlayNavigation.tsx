import React from 'react';

import { OverlayNavigationContainer } from './elements';

export interface OverlayNavigationProps {
  mount?: boolean;
}

export const OverlayNavigation: React.FC<OverlayNavigationProps> = ({
  mount,
  children,
}) => {
  if (!mount) return null;
  return <OverlayNavigationContainer>{children}</OverlayNavigationContainer>;
};
