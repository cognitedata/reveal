import React, { useEffect, useRef, ReactNode } from 'react';
import styled from 'styled-components';
import constant from 'lodash/constant';

import { keyboardNavigation } from '../../utils/keyboardNavigation';
import { ZoomControls } from '../zoom-controls/ZoomControls';

export const ReactSVGWindow = styled.div`
  position: relative;
`;

export const ReactSVGWrapper = styled.div`
  height: 100%;
  overflow: scroll;
  border: 2px solid;
`;

interface ViewportProps {
  children: ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({ children }) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  const {
    initNavigationEvents,
    zoomIn,
    zoomOut,
    resetZoom,
    removeNavigationEvents,
  } = keyboardNavigation();

  useEffect(() => {
    if (viewportRef.current) {
      initNavigationEvents(viewportRef.current as unknown as HTMLDivElement);
      return () => removeNavigationEvents();
    }
    return constant(true);
  });

  return (
    <ReactSVGWindow>
      <ReactSVGWrapper ref={viewportRef}>{children}</ReactSVGWrapper>
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
    </ReactSVGWindow>
  );
};
