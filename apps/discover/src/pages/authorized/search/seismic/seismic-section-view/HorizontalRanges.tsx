import * as React from 'react';

import {
  HorizontalRangeContainer,
  HorizontalRangeType,
  HorizontalRangeValue,
} from './elements';
import { XAxisData } from './types';

interface Props {
  type?: string;
  width: number;
  range: XAxisData[];
}

export const HorizontalRanges: React.FC<Props> = ({ type, width, range }) => {
  const Range = range.map((row) => (
    <HorizontalRangeValue key={row.index} left={row.left}>
      {row.value}
    </HorizontalRangeValue>
  ));

  return (
    <>
      <HorizontalRangeType>{type}</HorizontalRangeType>
      <HorizontalRangeContainer width={width}>{Range}</HorizontalRangeContainer>
      <HorizontalRangeType bottom>{type}</HorizontalRangeType>
      <HorizontalRangeContainer bottom width={width}>
        {Range}
      </HorizontalRangeContainer>
    </>
  );
};
