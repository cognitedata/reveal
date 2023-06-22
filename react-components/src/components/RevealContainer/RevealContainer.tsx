import { CogniteClient } from "@cognite/sdk";
import { useEffect, useRef, ReactNode, useState, useMemo } from "react";
import { Cognite3DViewer } from '@cognite/reveal';
import { RevealContext } from "./RevealContext";
import { Color } from "three";

type RevealContainerProps = {
  color?: Color;
  sdk: CogniteClient;
  children?: ReactNode;
}

export default function RevealContainer({ children, sdk, color }: RevealContainerProps) {
  const [viewer, setViewer] = useState<Cognite3DViewer>();
  const revealDomElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewer = new Cognite3DViewer({ sdk, domElement: revealDomElementRef.current! });
    viewer.setBackgroundColor({ color, alpha: 1 })
    setViewer(viewer);
    return () => {
      viewer.dispose();
      console.log('a');
      setViewer(undefined);
      console.log('b');
    }
  }, []);

  const mountChildren = (viewer: Cognite3DViewer | undefined) => {
    if (viewer === undefined) return <></>;
    return (
      <>
        <RevealContext.Provider value={viewer}>
          {children}
        </RevealContext.Provider>
      </>
    )
  }

  return (
    <div ref={revealDomElementRef}>
      {mountChildren(viewer)}
    </div>
  );
}