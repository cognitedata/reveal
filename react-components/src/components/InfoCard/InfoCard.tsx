/*!
 * Copyright 2023 Cognite AS
 */

import React, { type JSX, useEffect, useRef } from 'react';
import { type Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';

import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { useAuxillaryDivContext } from '../RevealContainer/AuxillaryDivProvider';

export type InfoCardElementMapping = {
  ref: React.RefObject<HTMLElement>;
  position: Vector3;
};

export type InfoCardProps = {
  position: Vector3;
  children: React.ReactNode;
  uniqueKey: string;
};

export const InfoCard = ({ position, children, uniqueKey }: InfoCardProps): JSX.Element => {
  const viewer = useReveal();

  const htmlTool = useRef<HtmlOverlayTool>(new HtmlOverlayTool(viewer));

  const auxContext = useAuxillaryDivContext();

  const htmlRef = useRef<HTMLDivElement>(null);
  const element = (
    <div className="infocard" key={uniqueKey} ref={htmlRef} style={{ position: 'absolute' }}>
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
