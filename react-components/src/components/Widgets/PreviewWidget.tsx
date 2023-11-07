/*!
 * Copyright 2023 Cognite AS
 */

import { Button } from '@cognite/cogs.js';
import { type ReactElement, useState, type ReactNode } from 'react';
import styled from 'styled-components';
import Widget from './Widget';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { useReveal } from '../RevealContainer/RevealContext';

type PreviewWidgetProps = {
  children?: ReactNode;
};

export const PreviewWidget = ({ children }: PreviewWidgetProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setOpen] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const reveal = useReveal();

  if (reveal === undefined) {
    return <></>;
  }

  const parentElement = reveal.domElement;

  const handleExpand = (): void => {
    setIsExpanded((prev) => !prev);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleDrag = (_event: DraggableEvent, data: DraggableData): void => {
    const { x, y, node } = data;
    const { left, top, width } = node.getBoundingClientRect();
    const {
      width: parentWidth,
      height: parentHeight,
      left: parentLeft,
      top: parentTop
    } = parentElement.getBoundingClientRect();

    const xOffset = 150;
    const yOffset = 50;

    if (
      left + width - xOffset < parentLeft ||
      top < parentTop ||
      left + xOffset > parentWidth ||
      top + yOffset > parentHeight
    ) {
      // Prevent moving beyond the canvas
      return;
    }

    setPosition({ x, y });
  };

  return (
    <Draggable onDrag={handleDrag} position={position}>
      <Widget
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
        }}>
        <Widget.Header title="Test component widget" type="3D">
          <Button type="ghost" icon={isExpanded ? 'Expand' : 'Collapse'} onClick={handleExpand} />
          <Button type="ghost" icon="Close" onClick={handleClose} />
        </Widget.Header>

        <Widget.Body>{!isExpanded && <WidgetContent>{children}</WidgetContent>}</Widget.Body>
      </Widget>
    </Draggable>
  );
};

const WidgetContent = styled.div`
  width: 100%;
  height: fit-content;
  padding: 0px 10px 10px 10px;
`;
