/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { useEffect, useRef, type ReactNode, useState, type ReactElement } from 'react';
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
}: RevealContainerProps): ReactElement {
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

  const mountChildren = (viewer: Cognite3DViewer | undefined): ReactElement => {
    if (viewer === undefined) return <></>;
    return (
      <>
        <RevealContext.Provider value={viewer}>{children}</RevealContext.Provider>
      </>
    );
  };

  return <div ref={revealDomElementRef}>{mountChildren(viewer)}</div>;
}
