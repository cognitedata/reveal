import React, { ReactNode } from 'react';

import { OverlayNavigationContainer } from './elements';

export interface OverlayNavigationProps {
  mount?: boolean;
  backgroundInvisibleMount?: boolean;
  children?: ReactNode;
}

export const OverlayNavigation: React.FC<OverlayNavigationProps> = ({
  mount,
  backgroundInvisibleMount,
  children,
}) => {
  if (!backgroundInvisibleMount && !mount) return null;

  return (
    <OverlayNavigationContainer mount={mount}>
      {children}
    </OverlayNavigationContainer>
  );
};
