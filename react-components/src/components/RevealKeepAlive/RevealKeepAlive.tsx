/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactNode, type ReactElement, useRef, useEffect } from 'react';
import { RevealKeepAliveContext } from './RevealKeepAliveContext';
import { type SceneIdentifiers } from '../SceneContainer/sceneTypes';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';

export function RevealKeepAlive({ children }: { children?: ReactNode }): ReactElement {
  const renderTargetRef = useRef<RevealRenderTarget>();
  const isRevealContainerMountedRef = useRef<boolean>(false);
  const sceneLoadedRef = useRef<SceneIdentifiers>();

  useEffect(() => {
    return () => {
      renderTargetRef.current?.dispose();
      renderTargetRef.current = undefined;
    };
  }, []);
  return (
    <RevealKeepAliveContext.Provider
      value={{
        renderTargetRef,
        isRevealContainerMountedRef,
        sceneLoadedRef
      }}>
      {children}
    </RevealKeepAliveContext.Provider>
  );
}
