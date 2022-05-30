import React, { ReactNode } from 'react';
import styled from 'styled-components';

export const ReactSVGWindow = styled.div`
  position: relative;
`;

export const ReactSVGWrapper = styled.div`
  height: 100%;
  border: 2px solid;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface ViewportProps {
  children: ReactNode;
}

export const Viewport: React.FC<ViewportProps> = ({ children }) => (
  <ReactSVGWindow>
    <ReactSVGWrapper>{children}</ReactSVGWrapper>
  </ReactSVGWindow>
);
