import { Context, type MutableRefObject, createContext, useContext } from 'react';
import { type SceneIdentifiers } from '../SceneContainer/sceneTypes';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';

export type RevealKeepAliveData = {
  renderTargetRef: MutableRefObject<RevealRenderTarget | undefined>;
  isRevealContainerMountedRef: MutableRefObject<boolean>;
  sceneLoadedRef: MutableRefObject<SceneIdentifiers | undefined>;
};

export const RevealKeepAliveContext: Context<RevealKeepAliveData | undefined> = createContext<RevealKeepAliveData | undefined>(undefined);

export const useRevealKeepAlive = (): RevealKeepAliveData | undefined => {
  return useContext(RevealKeepAliveContext);
};
