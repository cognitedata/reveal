/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, useMemo } from 'react';
import { RevealKeepAliveContext } from '../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { RevealCanvas } from '../../src/components/RevealCanvas/RevealCanvas';
import { type FdmNodeCache } from '../../src/components/NodeCacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../../src/components/NodeCacheProvider/AssetMappingCache';
import { type CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@cognite/reveal';
import { createSdkByUrlToken } from './createSdkByUrlToken';
import { type PointCloudAnnotationCache } from '../../src/components/NodeCacheProvider/PointCloudAnnotationCache';
import {
  RevealContext,
  type RevealContextProps
} from '../../src/components/RevealContext/RevealContext';

type RevealStoryContainerProps = Omit<RevealContextProps, 'sdk'> & {
  sdk?: CogniteClient;
  viewer?: Cognite3DViewer;
};

export const RevealStoryContext = ({
  viewer,
  sdk,
  children,
  ...rest
}: RevealStoryContainerProps): ReactElement => {
  const sdkInstance = useMemo(() => {
    if (sdk !== undefined) {
      return sdk;
    }
    return createSdkByUrlToken();
  }, [sdk]);

  const isLocal = sdkInstance.project === '';
  const viewerRef = useRef<Cognite3DViewer | undefined>(
    viewer ??
      (isLocal
        ? // @ts-expect-error use local models
          new Cognite3DViewer({ ...rest.viewerOptions, sdk: sdkInstance, _localModels: true })
        : undefined)
  );
  const isRevealContainerMountedRef = useRef<boolean>(true);
  const fdmNodeCache = useRef<FdmNodeCache | undefined>();
  const assetMappingCache = useRef<AssetMappingCache | undefined>();
  const pointCloudAnnotationCache = useRef<PointCloudAnnotationCache | undefined>();
  return (
    <RevealKeepAliveContext.Provider
      value={{
        viewerRef,
        isRevealContainerMountedRef,
        fdmNodeCache,
        assetMappingCache,
        pointCloudAnnotationCache
      }}>
      <RevealContext sdk={sdkInstance} {...rest}>
        {children}
      </RevealContext>
    </RevealKeepAliveContext.Provider>
  );
};

export const RevealStoryContainer = ({
  children,
  ...rest
}: RevealStoryContainerProps): ReactElement => {
  return (
    <RevealStoryContext {...rest}>
      <RevealCanvas>{children}</RevealCanvas>
    </RevealStoryContext>
  );
};
