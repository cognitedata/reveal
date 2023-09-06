/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef, type ReactElement, type RefObject, useState, useCallback } from 'react';
import { Vector2, type Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';

export type ViewerAnchorElementMapping = {
  ref: RefObject<HTMLElement>;
  position: Vector3;
};

export type ViewerAnchorProps = {
  position: Vector3;
  sticky?: boolean;
  stickyMargin?: number;
  children: ReactElement;
};

export const ViewerAnchor = ({
  position,
  children,
  sticky,
  stickyMargin
}: ViewerAnchorProps): ReactElement => {
  const viewer = useReveal();
  const [divTranslation, setDivTranslation] = useState(new Vector2());
  const [visible, setVisible] = useState(false);

  const cameraChanged = useCallback(
    (cameraPosition: Vector3, cameraTarget: Vector3): void => {
      const cameraDirection = cameraTarget.clone().sub(cameraPosition).normalize();
      const elementDirection = position.clone().sub(cameraPosition).normalize();

      setVisible(elementDirection.dot(cameraDirection) > 0);

      const screenSpacePosition = viewer.worldToScreen(position.clone());
      if (screenSpacePosition !== null) {
        setDivTranslation(screenSpacePosition);
      }
    },
    [viewer, position]
  );

  useEffect(() => {
    viewer.cameraManager.on('cameraChange', cameraChanged);

    cameraChanged(
      viewer.cameraManager.getCameraState().position,
      viewer.cameraManager.getCameraState().target
    );

    return () => {
      viewer.cameraManager.off('cameraChange', cameraChanged);
    };
  }, [cameraChanged]);

  const htmlRef = useRef<HTMLDivElement>(null);

  const domDimensions = [viewer.domElement.clientWidth, viewer.domElement.clientHeight] as [
    number,
    number
  ];
  const cssTranslation = computeCssOffsetWithStickiness(
    divTranslation,
    domDimensions,
    sticky,
    stickyMargin
  );

  return visible ? (
    <div
      ref={htmlRef}
      style={{
        position: 'absolute',
        left: '0px',
        top: '0px',
        transform: cssTranslation
      }}>
      {children}
    </div>
  ) : (
    <></>
  );
};

function computeCssOffsetWithStickiness(
  unboundedPosition: Vector2,
  [domWidth, domHeight]: [number, number],
  sticky?: boolean,
  stickyMargin?: number
): string {
  if (sticky !== true) {
    return `translateX(${unboundedPosition.x}px) translateY(${unboundedPosition.y}px)`;
  }

  const margin = stickyMargin ?? 0;

  const maxXPos = `${domWidth}px - 100% - ${margin}px`;
  const maxYPos = `${domHeight}px - 100% - ${margin}px`;

  const minXPos = `${margin}px`;
  const minYPos = `${margin}px`;

  return `translateX(max(${minXPos}, min(${maxXPos}, ${unboundedPosition.x}px)))
translateY(max(${minYPos}, min(${maxYPos}, ${unboundedPosition.y}px)))`;
}
