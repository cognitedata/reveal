import { MutableRefObject } from 'react';

export const getOverflownElementsInfo = (
  ref: MutableRefObject<HTMLDivElement | null>,
  ignoreElements: string[] = []
) => {
  const offsetRight = ref.current
    ? ref.current.offsetLeft + ref.current.offsetWidth
    : 0;

  let lastOffset = 0;
  let lastIndex = -1;

  ((ref.current?.childNodes || []) as NodeListOf<HTMLElement>).forEach(
    (child) => {
      if (ignoreElements.includes(child.id)) {
        return;
      }
      const elementOffsetRight = child.offsetLeft + child.offsetWidth;
      if (elementOffsetRight < offsetRight) {
        lastOffset = elementOffsetRight;
        lastIndex += 1;
      }
    }
  );
  return { lastOffset, lastIndex };
};
