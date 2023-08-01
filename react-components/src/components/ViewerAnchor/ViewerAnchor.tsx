/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef, type ReactElement, type RefObject, useState } from 'react';
import { Vector2, type Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';

export type ViewerAnchorElementMapping = {
  ref: RefObject<HTMLElement>;
  position: Vector3;
};

export type ViewerAnchorProps = {
  position: Vector3;
  children: ReactElement;
  uniqueKey: string;
};

export const ViewerAnchor = ({
  position,
  children,
  uniqueKey
}: ViewerAnchorProps): ReactElement => {
  const viewer = useReveal();
  const [vec, setVec] = useState(new Vector2());

  const sceneRendered = (): void => {
    const screenSpacePosition = viewer.worldToScreen(position);
    if (screenSpacePosition !== null) {
      setVec(screenSpacePosition);
    }
  };

  useEffect(() => {
    viewer.on('sceneRendered', sceneRendered);
    return () => {
      viewer.off('sceneRendered', sceneRendered);
    };
  }, [sceneRendered]);

  const htmlRef = useRef<HTMLDivElement>(null);
  return (
    <div
      key={uniqueKey}
      ref={htmlRef}
      style={{
        position: 'absolute',
        left: '0px',
        top: '0px',
        transform: `translateX(${vec.x}px) translateY(${vec.y}px)`
      }}>
      {children}
    </div>
  );
};
