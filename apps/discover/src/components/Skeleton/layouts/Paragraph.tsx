import * as React from 'react';

import times from 'lodash/times';

import Text from './Text';

export interface Props {
  lines?: number;
}
/**
 * Creates a skeleton that looks like a text or paragraph
 *
 * @param {Number} lines - Amount of lines to be rendered
 * @example <Skeleton.Paragraph lines={3} />
 */
export const Paragraph: React.FC<Props> = ({ lines = 1 }) => {
  const linesArr: number[] = times(lines);

  return (
    <>
      {linesArr.map((_, i) => (
        <Text
          key={`line-${_}`}
          data-testid="paragraph"
          currentLine={i}
          isOnlyLine={linesArr.length === 1}
          isLastLine={linesArr.length === i + 1}
        />
      ))}
    </>
  );
};

export default Paragraph;
