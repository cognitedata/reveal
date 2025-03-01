/*!
 * Copyright 2023 Cognite AS
 */
import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import { createContext, type ReactElement, type ReactNode, useContext, useEffect } from 'react';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';

const ViewerContext = createContext<RevealRenderTarget | null>(null);

export type ViewerContextProviderProps = {
  value: RevealRenderTarget | null;
  children: ReactNode;
};

export const ViewerContextProvider = ({
  value,
  children
}: ViewerContextProviderProps): ReactElement => {
  useEffect(() => {
    window.renderTarget = value ?? undefined;
    window.viewer = value?.viewer;
    return () => {
      window.renderTarget = undefined;
      window.viewer = undefined;
    };
  }, [value]);

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
};

export const useReveal = (): Cognite3DViewer<DataSourceType> => {
  const renderTarget = useRenderTarget();
  return renderTarget.viewer;
};

export const useRenderTarget = (): RevealRenderTarget => {
  const renderTarget = useContext(ViewerContext);
  if (renderTarget === null) {
    throw new Error('useRenderTarget must be used within a ViewerProvider');
  }
  return renderTarget;
};
