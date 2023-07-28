/*!
 * Copyright 2023 Cognite AS
 */

import React, { JSX, useState, useEffect, useRef } from 'react';
import { Vector3 } from 'three';

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
};

export const InfoCard = ({ position, children }: InfoCardProps): JSX.Element => {
  const viewer = useReveal();

  const mods = useAuxillaryDivContext();

  const htmlRef = useRef<HTMLDivElement>(null);
  const element = (
    <div id={'infoCardContent'} key={'info'} ref={htmlRef} style={{ position: 'absolute' }}>
      {children}
    </div>
  );

  const [htmlTool, _setHtmlTool] = useState<HtmlOverlayTool>(new HtmlOverlayTool(viewer));

  useEffect(() => {
    mods.addElement(element);
    return () => mods.removeElement(element);
  }, []);

  useEffect(() => {
    if (htmlRef.current === null) {
      return;
    }

    htmlTool.clear();
    htmlTool.add(htmlRef.current, position);
  }, [htmlTool, children, htmlRef.current]);

  return <></>;
};
