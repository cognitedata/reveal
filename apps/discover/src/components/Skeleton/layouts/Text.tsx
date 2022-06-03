import React from 'react';

import { Rectangle, Circle } from '../elements';

const Base = {
  Rectangle,
  Circle,
};

export interface Props {
  currentLine?: number;
  isLastLine?: boolean;
  isOnlyLine?: boolean;
}
/**
 * Creates a skeleton that looks like a line of text with a seemingly random width.
 *
 * @param {Number} currentLine - Current line (usually "i" in a map function)
 * @param {Number} isLastLine - should be true if this is the last line in a paragraph
 * @param {Number} isOnlyLine - should be true rendering only one line
 * @example <Skeleton.Text currentLine={3} isLastLine />
 */
export const Text: React.FC<Props> = ({
  isOnlyLine,
  currentLine = 0,
  isLastLine,
}) => {
  // Prevent having to using Math.random (changing lengths on rerender)
  const lengths = [0.5, 0.4, 0.6, 0.3, 0.7, 0.3, 0.2, 0.9, 0.1, 0.4];

  let width = '';
  if (isOnlyLine) {
    // If there is only one line
    width = `${(0.2 + lengths[currentLine] * 0.3) * 100}%`;
  } else if (isLastLine) {
    // The last line of a paragraph
    width = '30%';
  } else {
    // Every line in a paragraph, exept for the last
    width = `${(0.3 + lengths[currentLine] * 0.6) * 100}%`;
  }

  return <Base.Rectangle role="row" width={width} />;
};

export default Text;
