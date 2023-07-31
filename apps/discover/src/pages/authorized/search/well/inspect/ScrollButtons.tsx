import React, { MutableRefObject, useEffect, useState } from 'react';

import { Button, Icon } from '@cognite/cogs.js';

import { TabsControllerButton } from './elements';

export interface Props {
  scrollRef: MutableRefObject<HTMLDivElement | undefined>;
}

const SCROLL_PER_CLICK = 200;

export const ScrollButtons: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  scrollRef,
}) => {
  const [scrollButtonDisplay, setScrollButtonDisplay] = useState({
    left: false,
    right: true,
  });

  const scroll = (right?: boolean) => {
    if (scrollRef?.current) {
      const elm = scrollRef.current;
      const left = elm.scrollLeft + (right ? 1 : -1) * SCROLL_PER_CLICK;
      elm.scrollTo({
        left,
        behavior: 'smooth',
      });
    }
  };

  const updateScrollButtonDisplay = () => {
    const elm = scrollRef?.current;
    if (elm) {
      setScrollButtonDisplay((state) => ({
        ...state,
        left: elm.scrollLeft > 0,
        right: elm.scrollWidth > elm.clientWidth + elm.scrollLeft,
      }));
    }
  };

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.addEventListener('scroll', updateScrollButtonDisplay);
      updateScrollButtonDisplay();
    }
    window.addEventListener('resize', updateScrollButtonDisplay);
    return () =>
      window.removeEventListener('resize', updateScrollButtonDisplay);
  }, []);

  return (
    <>
      <TabsControllerButton visible={scrollButtonDisplay.left}>
        <Button
          type="ghost"
          size="small"
          aria-label="prev"
          data-testid="scroll-prev"
          onClick={() => scroll()}
        >
          <Icon type="ChevronLeft" size={16} />
        </Button>
      </TabsControllerButton>
      {children}
      <TabsControllerButton right visible={scrollButtonDisplay.right}>
        <Button
          type="ghost"
          size="small"
          aria-label="next"
          data-testid="scroll-next"
          onClick={() => scroll(true)}
        >
          <Icon type="ChevronRight" size={16} />
        </Button>
      </TabsControllerButton>
    </>
  );
};
