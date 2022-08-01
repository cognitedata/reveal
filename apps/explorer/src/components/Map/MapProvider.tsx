import { Cognite3DViewer, Cognite3DModel } from '@cognite/reveal';
import React from 'react';

type MapContextValue = {
  viewerRef: React.MutableRefObject<Cognite3DViewer>;
  modelRef: React.MutableRefObject<Cognite3DModel>;
};
export const MapContext = React.createContext<MapContextValue>(
  {} as MapContextValue
);

export const MapProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const viewerRef = React.useRef<Cognite3DViewer>();
  const modelRef = React.useRef<Cognite3DModel>();

  const value = React.useMemo(
    () => ({
      viewerRef,
      modelRef,
    }),
    [viewerRef, modelRef]
  );
  return (
    <MapContext.Provider value={value as MapContextValue}>
      {children}
    </MapContext.Provider>
  );
};
