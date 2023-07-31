import * as React from 'react';

import { ImageCompareDraggerContainer } from './elements';

interface Props {
  position: number;
  handleMouseDown: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void;
}

export const ImageCompareDragger: React.FC<Props> = (props) => {
  const { position, handleMouseDown } = props;
  return (
    // eslint-disable-next-line jsx-a11y/control-has-associated-label
    <ImageCompareDraggerContainer
      style={{ left: position - 12.5 }}
      role="button"
      tabIndex={0}
      draggable
      onMouseDown={handleMouseDown}
    />
  );
};

export default ImageCompareDragger;
