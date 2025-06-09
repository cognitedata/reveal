import {
  useEffect,
  useRef,
  type RefObject,
  useState,
  useCallback,
  type CSSProperties,
  type ReactNode
} from 'react';
import { Vector2, type Vector3 } from 'three';

import { useReveal } from '../RevealCanvas/ViewerContext';
import { type DataSourceType, type Cognite3DViewer } from '@cognite/reveal';
import { clamp } from 'lodash';

type ViewerAnchorStyle = Omit<CSSProperties, 'position' | 'left' | 'top'>;

export type ViewerAnchorProps = {
  position: Vector3;
  sticky?: boolean;
  stickyMargin?: number;
  style?: ViewerAnchorStyle;
  children: ReactNode;
};

export const ViewerAnchor = ({
  position: position3d,
  children,
  style: inputStyle,
  sticky,
  stickyMargin: inputStickyMargin
}: ViewerAnchorProps): ReactNode => {
  const viewer = useReveal();

  const stickyMargin = inputStickyMargin ?? 0;

  const { projectedPoint, visible } = usePointProjection(position3d, viewer);

  const htmlRef = useRef<HTMLDivElement>(null);

  const stickyCompensation = useStickyCompensation(
    htmlRef,
    viewer.domElement,
    sticky ?? false,
    stickyMargin,
    projectedPoint
  );

  const style = computeCombinedTranslationCss(projectedPoint, stickyCompensation, inputStyle);

  return visible ? (
    <div
      ref={htmlRef}
      style={{
        ...style,
        position: 'absolute',
        left: '0px',
        top: '0px'
      }}>
      {children}
    </div>
  ) : (
    <></>
  );
};

function usePointProjection(
  position3d: Vector3,
  viewer: Cognite3DViewer<DataSourceType>
): { projectedPoint: Vector2; visible: boolean } {
  const [projectedPoint, setProjectedPoint] = useState(new Vector2());
  const [visible, setVisible] = useState(false);

  const cameraChanged = useCallback(
    (cameraPosition: Vector3, cameraTarget: Vector3): void => {
      const cameraDirection = cameraTarget.clone().sub(cameraPosition).normalize();
      const elementDirection = position3d.clone().sub(cameraPosition).normalize();

      setVisible(elementDirection.dot(cameraDirection) > 0);

      const screenSpacePosition = viewer.worldToScreen(position3d.clone());
      if (screenSpacePosition !== null) {
        setProjectedPoint(screenSpacePosition);
      }
    },
    [viewer, position3d]
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

  return { visible, projectedPoint };
}

function useStickyCompensation(
  htmlRef: RefObject<HTMLDivElement>,
  viewerDomElement: HTMLElement,
  sticky: boolean,
  stickyMargin: number,
  originalPosition: Vector2
): Vector2 {
  const [stickyCompensation, setStickyCompensation] = useState(new Vector2());

  useEffect(() => {
    if (sticky && htmlRef.current !== null) {
      const newStickyCompensation = computeNewStickyCompensation(
        htmlRef.current.getBoundingClientRect(),
        viewerDomElement.getBoundingClientRect(),
        stickyCompensation,
        stickyMargin
      );

      if (!newStickyCompensation.equals(stickyCompensation)) {
        setStickyCompensation(newStickyCompensation);
      }
    } else {
      setStickyCompensation(new Vector2());
    }
  }, [
    originalPosition.x,
    originalPosition.y,
    sticky,
    stickyMargin,
    viewerDomElement.clientWidth,
    viewerDomElement.clientHeight
  ]);

  return stickyCompensation;
}

function computeNewStickyCompensation(
  anchorDomRect: DOMRect,
  viewerDomRect: DOMRect,
  oldStickyCompensation: Vector2,
  stickyMargin: number
): Vector2 {
  const newStickyCompensation = oldStickyCompensation.clone();

  const uncompensatedLocalRect = new DOMRect(
    anchorDomRect.left - viewerDomRect.left - oldStickyCompensation.x,
    anchorDomRect.top - viewerDomRect.top - oldStickyCompensation.y,
    anchorDomRect.width,
    anchorDomRect.height
  );

  const minXTranslation = stickyMargin;
  const maxXTranslation = viewerDomRect.width - uncompensatedLocalRect.width - stickyMargin;
  const minYTranslation = stickyMargin;
  const maxYTranslation = viewerDomRect.height - uncompensatedLocalRect.height - stickyMargin;

  newStickyCompensation.x = clamp(
    0,
    minXTranslation - uncompensatedLocalRect.left,
    maxXTranslation - uncompensatedLocalRect.left
  );

  newStickyCompensation.y = clamp(
    0,
    minYTranslation - uncompensatedLocalRect.top,
    maxYTranslation - uncompensatedLocalRect.top
  );

  Math.min(
    maxXTranslation - uncompensatedLocalRect.left,
    Math.max(minXTranslation - uncompensatedLocalRect.left, 0)
  );

  return newStickyCompensation;
}

function computeCombinedTranslationCss(
  pointPositionOnScreen: Vector2,
  stickyCompensation: Vector2,
  inputStyle?: CSSProperties | undefined
): CSSProperties {
  const inherentTranslation = `translateX(calc(${pointPositionOnScreen.x}px + ${stickyCompensation.x}px))
translateY(calc(${pointPositionOnScreen.y}px + ${stickyCompensation.y}px))`;

  const style = { ...inputStyle };
  const userProvidedTranslation = style.transform;
  style.transform = `${userProvidedTranslation ?? ''} ${inherentTranslation}`;
  return style;
}
