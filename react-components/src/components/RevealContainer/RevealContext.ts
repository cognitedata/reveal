import { type Cognite3DViewer } from '@cognite/reveal';
import { createContext, useContext } from 'react';

export const RevealContext = createContext<Cognite3DViewer | null>(null);

export const useReveal = (): Cognite3DViewer => {
  const reveal = useContext(RevealContext);
  if (reveal == null) {
    throw new Error('useReveal must be used within a RevealProvider');
  }
  return reveal;
};
