/*!
 * Copyright 2023 Cognite AS
 */
import { type Cognite3DViewer } from '@cognite/reveal';
import { type MutableRefObject, createContext, useContext } from 'react';
import { type FdmNodeCache } from '../NodeCacheProvider/FdmNodeCache';
import { AssetMappingCache } from '../NodeCacheProvider/AssetMappingCache';

export type RevealKeepAliveData = {
  viewerRef: MutableRefObject<Cognite3DViewer | undefined>;
  isRevealContainerMountedRef: MutableRefObject<boolean>;
  fdmNodeCache: MutableRefObject<FdmNodeCache | undefined>;
  assetMappingCache: MutableRefObject<AssetMappingCache | undefined>;
};

export const RevealKeepAliveContext = createContext<RevealKeepAliveData | undefined>(undefined);

export const useRevealKeepAlive = (): RevealKeepAliveData | undefined => {
  return useContext(RevealKeepAliveContext);
};
