import { type CogniteClient } from '@cognite/sdk';
import React, { useEffect, useRef, type ReactNode, useState } from 'react';
import { Cognite3DViewer } from '@cognite/reveal';
import { RevealContext } from './RevealContext';
import { type Color } from 'three';

interface RevealContainerProps {
  color?: Color;
  sdk: CogniteClient;
  children?: ReactNode;
}

export default function RevealContainer({
  children,
  sdk,
  color
}: RevealContainerProps): React.JSX.Element {
  const [viewer, setViewer] = useState<Cognite3DViewer>();
  const revealDomElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domElement = revealDomElementRef.current;
    if (domElement === null) {
      throw new Error('Failure in mounting RevealContainer to DOM.');
    }
    const viewer = new Cognite3DViewer({ sdk, domElement });
    viewer.setBackgroundColor({ color, alpha: 1 });
    setViewer(viewer);
    return () => {
      viewer.dispose();
      setViewer(undefined);
    };
  }, []);

  const mountChildren = (viewer: Cognite3DViewer | undefined): React.JSX.Element => {
    if (viewer === undefined) return <></>;
    return (
      <>
        <RevealContext.Provider value={viewer}>{children}</RevealContext.Provider>
      </>
    );
  };

  return <div ref={revealDomElementRef}>{mountChildren(viewer)}</div>;
}
