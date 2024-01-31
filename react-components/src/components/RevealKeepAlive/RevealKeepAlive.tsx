/*!
 * Copyright 2023 Cognite AS
 */

import { type Cognite3DViewer } from '@cognite/reveal';
import { type ReactNode, type ReactElement, useRef, useEffect } from 'react';
import { RevealKeepAliveContext } from './RevealKeepAliveContext';
import { type FdmNodeCache } from '../NodeCacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../NodeCacheProvider/AssetMappingCache';
import { type PointCloudObjectCollectionCache } from '../NodeCacheProvider/PointCloudObjectCollectionCache';

export function RevealKeepAlive({ children }: { children?: ReactNode }): ReactElement {
  const viewerRef = useRef<Cognite3DViewer>();
  const isRevealContainerMountedRef = useRef<boolean>(false);
  const fdmNodeCache = useRef<FdmNodeCache>();
  const assetMappingCache = useRef<AssetMappingCache>();
  const pointCloudObjectCollectionCache = useRef<PointCloudObjectCollectionCache>();

  useEffect(() => {
    return () => {
      viewerRef.current?.dispose();
      viewerRef.current = undefined;
    };
  }, []);
  return (
    <RevealKeepAliveContext.Provider
      value={{
        viewerRef,
        isRevealContainerMountedRef,
        fdmNodeCache,
        assetMappingCache,
        pointCloudObjectCollectionCache
      }}>
      {children}
    </RevealKeepAliveContext.Provider>
  );
}
