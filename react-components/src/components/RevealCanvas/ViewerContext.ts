/*!
 * Copyright 2023 Cognite AS
 */
import { type Cognite3DViewer } from '@cognite/reveal';
import { createContext, useContext } from 'react';

export const ViewerContext = createContext<Cognite3DViewer | null>(null);

export const useReveal = (): Cognite3DViewer => {
  const reveal = useContext(ViewerContext);
  if (reveal === null) {
    throw new Error('useReveal must be used within a ViewerProvider');
  }
  return reveal;
};
