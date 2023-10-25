/*!
 * Copyright 2023 Cognite AS
 */
import { useRef, type ReactElement, type ReactNode, useMemo } from 'react';
import { RevealKeepAliveContext } from '../../src/components/RevealKeepAlive/RevealKeepAliveContext';
import { RevealContainer } from '../../src/components/RevealContainer/RevealContainer';
import { type FdmNodeCache } from '../../src/components/NodeCacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../../src/components/NodeCacheProvider/AssetMappingCache';
import { type CogniteClient } from '@cognite/sdk';
import { type Color } from 'three';
import { Cognite3DViewer, type Cognite3DViewerOptions } from '@cognite/reveal';
import { createSdkByUrlToken } from './createSdkByUrlToken';

type RevealStoryContainerProps = {
  sdk?: CogniteClient;
  viewer?: Cognite3DViewer;
  color?: Color;
  appLanguage?: string;
  children?: ReactNode;
  viewerOptions?: Pick<
    Cognite3DViewerOptions,
    | 'antiAliasingHint'
    | 'loadingIndicatorStyle'
    | 'rendererResolutionThreshold'
    | 'antiAliasingHint'
    | 'ssaoQualityHint'
    | 'pointCloudEffects'
    | 'enableEdges'
  >;
};

export const RevealStoryContainer = ({
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
  return (
    <RevealKeepAliveContext.Provider
      value={{
        viewerRef,
        isRevealContainerMountedRef,
        fdmNodeCache,
        assetMappingCache
      }}>
      <RevealContainer sdk={sdkInstance} {...rest}>
        {children}
      </RevealContainer>
    </RevealKeepAliveContext.Provider>
  );
};
