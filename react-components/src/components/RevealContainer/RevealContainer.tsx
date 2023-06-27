/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { useEffect, useRef, type ReactNode, useState, type ReactElement } from 'react';
import { Cognite3DViewer } from '@cognite/reveal';
import { RevealContext } from './RevealContext';
import { type Color } from 'three';

type RevealContainerProps = {
  color?: Color;
  sdk: CogniteClient;
  children?: ReactNode;
};

export default function RevealContainer({
  children,
  sdk,
  color
}: RevealContainerProps): ReactElement {
  const [viewer, setViewer] = useState<Cognite3DViewer>();
  const revealDomElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeViewer();
    return disposeViewer;
  }, []);

  return <div ref={revealDomElementRef}>{mountChildren()}</div>;

  function mountChildren(): ReactElement {
    if (viewer === undefined) return <></>;
    return (
      <>
        <RevealContext.Provider value={viewer}>{children}</RevealContext.Provider>
      </>
    );
  }

  function initializeViewer(): void {
    const domElement = revealDomElementRef.current;
    if (domElement === null) {
      throw new Error('Failure in mounting RevealContainer to DOM.');
    }
    const viewer = new Cognite3DViewer({ sdk, domElement });
    viewer.setBackgroundColor({ color, alpha: 1 });
    setViewer(viewer);
  }

  function disposeViewer(): void {
    if (viewer === undefined) return;
    viewer.dispose();
    setViewer(undefined);
  }
}
