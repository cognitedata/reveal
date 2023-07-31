/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect, useRef, ReactElement } from 'react';
import { type Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';

import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { useAuxillaryDivContext } from './AuxillaryDivProvider';

export type ViewerAnchorElementMapping = {
  ref: React.RefObject<HTMLElement>;
  position: Vector3;
};

export type ViewerAnchorProps = {
  position: Vector3;
  children: ReactElement;
  uniqueKey: string;
};

export const ViewerAnchor = ({ position, children, uniqueKey }: ViewerAnchorProps): ReactElement => {
  const viewer = useReveal();

  const htmlTool = useRef<HtmlOverlayTool>(new HtmlOverlayTool(viewer));

  const auxContext = useAuxillaryDivContext();

  const htmlRef = useRef<HTMLDivElement>(null);
  const element = (
    <div key={uniqueKey} ref={htmlRef} style={{ position: 'absolute' }}>
      {children}
    </div>
  );

  useEffect(() => {
    auxContext.addElement(element);
    return () => {
      auxContext.removeElement(element);
    };
  }, []);

  useEffect(() => {
    if (htmlRef.current === null) {
      return;
    }

    const elementRef = htmlRef.current;

    htmlTool.current.add(elementRef, position);

    return () => {
      htmlTool.current.remove(elementRef);
    };
  }, [auxContext, children, htmlRef.current]);

  return <></>;
};
