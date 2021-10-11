import React from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';

import { ResizeHandle } from './elements';

export interface Props {
  width: number;
  minWidth: number;
  maxWidth: number;
  onResize: (width: number) => void;
}

export const HorizontalResizableBox: React.FC<Props> = ({
  children,
  width,
  minWidth,
  maxWidth,
  onResize,
}) => {
  return (
    <ResizableBox
      className="horizontal-resizer"
      width={width}
      height={0}
      axis="x"
      resizeHandles={['e']}
      minConstraints={[minWidth, minWidth]}
      maxConstraints={[maxWidth, maxWidth]}
      onResize={(
        _event: React.SyntheticEvent,
        resizeData: ResizeCallbackData
      ) => {
        onResize(resizeData.size.width);
      }}
      handle={<ResizeHandle data-testid="resize-handle-horizontal" />}
    >
      {children}
    </ResizableBox>
  );
};
