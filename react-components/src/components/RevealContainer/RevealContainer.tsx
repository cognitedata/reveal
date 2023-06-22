import { CogniteClient } from "@cognite/sdk";
import { useEffect, useRef } from "react";
import { Cognite3DViewer } from '@cognite/reveal';


export default function RevealContainer() {
  const revealDomElementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sdk = new CogniteClient({ appId: 'reveal.example', project: 'test', getToken: () => Promise.resolve('') });
    const asdf = new Cognite3DViewer({ sdk, domElement: revealDomElementRef.current! });
  }, [])
  return (
    <div ref={revealDomElementRef}>
      <h1>RevealContainer</h1>
    </div>
  );
}