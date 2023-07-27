/*!
 * Copyright 2023 Cognite AS
 */

import React, { JSX, useState, useEffect, useRef } from 'react';

import { Vector3 } from 'three';

import { useReveal } from '../RevealContainer/RevealContext';

import { HtmlOverlayTool } from '@cognite/reveal/tools';

import styled from 'styled-components';

export type InfoCardProps = {
  card: JSX.Element;
  position: Vector3;
};

export const InfoCard = ({
  card,
  position
}: InfoCardProps): JSX.Element => {
  const viewer = useReveal();

  const divReference = useRef<HTMLDivElement>(null);
  const [htmlTool, _setHtmlTool] = useState<HtmlOverlayTool>(new HtmlOverlayTool(viewer));
  const htmlElement = (<div ref={divReference}> {card} </div>);

  useEffect(() => {
    if (divReference.current === null) return;
    const innerElement = divReference.current;

    htmlTool.add(innerElement, position);

    return () => htmlTool.remove(innerElement);
  }, [card, htmlTool, divReference.current]);

  return htmlElement;
}

export const FloatingDiv = styled.div`
  position: absolute;
`
