import set from 'lodash/set';
import times from 'lodash/times';

const ELEMENT_GAP = 16;

export const getScrollLeft = (scrollRef: React.RefObject<HTMLDivElement>) => {
  /**
   * Sometimes, the value of `scrollLeft` has some descimal places.
   * This affects to the calculations made with the value.
   * Hence, return the value by rounding up to the next largest integer.
   */
  return Math.ceil(scrollRef.current?.scrollLeft || 0);
};

export const getScrollWidthInfo = (
  scrollRef: React.RefObject<HTMLDivElement>
) => {
  const cards = scrollRef.current?.children;

  if (!cards || !scrollRef.current) {
    return {
      currentWidth: 0,
      lastWidth: 0,
    };
  }

  let currentWidth = 0;

  const lastWidths: number[] = [];

  times(cards.length).forEach((index) => {
    if (currentWidth <= getScrollLeft(scrollRef)) {
      currentWidth = currentWidth + cards[index].clientWidth + ELEMENT_GAP;
      lastWidths.unshift(cards[index].clientWidth + ELEMENT_GAP);
    }
  });

  /**
   * The `lastWidths` consists of a repetition of 2 values always.
   * Just like [x1, x2, x1, x2, ...]
   * We just want the sum of x1 and x2.
   * Hence, getting only the first 2 elements of the `lastWidths` array.
   */
  const lastWidth = lastWidths
    .slice(0, 2)
    .reduce((total, width) => total + width, 0);

  return {
    currentWidth,
    lastWidth,
  };
};

export const scrollLeft = (scrollRef: React.RefObject<HTMLDivElement>) => {
  const { currentWidth, lastWidth } = getScrollWidthInfo(scrollRef);
  set(scrollRef, 'current.scrollLeft', currentWidth - lastWidth);
};

export const scrollRight = (scrollRef: React.RefObject<HTMLDivElement>) => {
  const { currentWidth, lastWidth } = getScrollWidthInfo(scrollRef);
  set(scrollRef, 'current.scrollLeft', currentWidth + lastWidth);
};

export const getScrollDisabledStatus = (
  scrollRef: React.RefObject<HTMLDivElement>
) => {
  if (
    !scrollRef.current ||
    scrollRef.current.offsetWidth === scrollRef.current.scrollWidth
  ) {
    return {
      leftDisabled: true,
      rightDisabled: true,
    };
  }

  const isStart = getScrollLeft(scrollRef) === 0;
  const isEnd =
    scrollRef.current.offsetWidth + getScrollLeft(scrollRef) >=
    scrollRef.current.scrollWidth;

  return {
    leftDisabled: isStart,
    rightDisabled: isEnd,
  };
};
