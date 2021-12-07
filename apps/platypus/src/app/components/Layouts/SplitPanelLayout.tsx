import { createRef, useEffect, useState } from 'react';
import { SplitPanel } from './elements';

const MIN_WIDTH = 100;

export interface SplitPanelProps {
  sidebar: React.ReactNode;
  sidebarWidth?: number | string;
  sidebarMinWidth?: number;
  content: React.ReactNode;
}
export const SplitPanelLayout = (props: SplitPanelProps) => {
  const splitPaneRef = createRef<HTMLDivElement>();
  const [leftPanelWidth, setLeftPanelWidth] = useState(
    props.sidebarWidth || 250
  );
  const [dragging, setDragging] = useState(false);
  const [separatorXPosition, setSeparatorXPosition] = useState<
    undefined | number
  >(undefined);

  const onMouseDown = (e: React.MouseEvent) => {
    setSeparatorXPosition(e.clientX);
    setDragging(true);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setSeparatorXPosition(e.touches[0].clientX);
    setDragging(true);
  };

  const isString = (value: unknown) =>
    Object.prototype.toString.call(value) === '[object String]';

  const onMove = (clientX: number) => {
    if (dragging && leftPanelWidth && separatorXPosition) {
      let newLeftWidth = clientX;
      const minWidth = props.sidebarMinWidth || MIN_WIDTH;
      if (newLeftWidth < minWidth) {
        newLeftWidth = minWidth;
      }
      setLeftPanelWidth(newLeftWidth);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault();
    onMove(e.clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    onMove(e.touches[0].clientX);
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  });

  return (
    <SplitPanel>
      <div
        className="split-panel-sidebar"
        ref={splitPaneRef}
        style={{
          width: isString(leftPanelWidth)
            ? leftPanelWidth
            : `${leftPanelWidth}px`,
        }}
      >
        {props.sidebar}
      </div>
      <div
        className="divider-hitbox"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onMouseUp}
      >
        <div className="divider" />
      </div>
      <div className="split-panel-content">{props.content}</div>
    </SplitPanel>
  );
};
