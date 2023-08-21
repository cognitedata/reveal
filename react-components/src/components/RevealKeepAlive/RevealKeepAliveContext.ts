/*!
 * Copyright 2023 Cognite AS
 */
import { type Cognite3DViewer } from '@cognite/reveal';
import { type MutableRefObject, createContext, useContext } from 'react';

export type RevealKeepAliveData = {
  viewerRef: MutableRefObject<Cognite3DViewer | undefined>;
  isRevealContainerMountedRef: MutableRefObject<boolean>;
};

export const RevealKeepAliveContext = createContext<RevealKeepAliveData | undefined>(undefined);

export const useRevealKeepAlive = (): RevealKeepAliveData | undefined => {
  return useContext(RevealKeepAliveContext);
};
