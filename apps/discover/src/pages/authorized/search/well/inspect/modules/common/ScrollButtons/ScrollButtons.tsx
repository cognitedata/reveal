import React, { useEffect, useState } from 'react';

import set from 'lodash/set';

import { Button } from '@cognite/cogs.js';

import { Wrapper } from './elements';

interface Props {
  scrollRef: React.RefObject<HTMLDivElement>;
}

const ELEMENT_GAP = 16;

export const ScrollButtons: React.FC<Props> = ({ scrollRef }) => {
  const cards = scrollRef.current?.children;
  const [leftDisabled, setLeftDisabled] = useState(false);
  const [rightDisabled, setRightDisabled] = useState(false);

  const getScrollLeft = () => scrollRef.current?.scrollLeft || 0;

  const onScroll = () => {
    if (!scrollRef.current) return;

    if (scrollRef.current.offsetWidth === scrollRef.current.scrollWidth) {
      setLeftDisabled(true);
      setRightDisabled(true);
      return;
    }

    const isStart = getScrollLeft() === 0;
    const isEnd =
      scrollRef.current.offsetWidth + getScrollLeft() >=
      scrollRef.current.scrollWidth;

    setLeftDisabled(isStart);
    setRightDisabled(isEnd);
  };

  useEffect(() => {
    // Give some time to update scroll element reference
    setTimeout(() => {
      onScroll();
    }, 1000);
    scrollRef.current?.addEventListener('scroll', onScroll);
    return () => scrollRef.current?.removeEventListener('scroll', onScroll);
  }, []);

  const scroll = (left?: boolean) => {
    if (cards && scrollRef.current) {
      let currentWidth = 0;

      const lastWidths: number[] = [];

      [...Array(cards.length)].forEach((_, i) => {
        if (currentWidth <= getScrollLeft()) {
          currentWidth = currentWidth + cards[i].clientWidth + ELEMENT_GAP;
          lastWidths.unshift(cards[i].clientWidth + ELEMENT_GAP);
        }
      });

      const lastWidth = lastWidths
        .slice(0, 2)
        .reduce((total, width) => total + width, 0);

      if (left) {
        set(scrollRef, 'current.scrollLeft', currentWidth - lastWidth);
      } else {
        set(scrollRef, 'current.scrollLeft', currentWidth);
      }
    }
  };
  return (
    <Wrapper>
      <Button
        onClick={() => {
          scroll(true);
        }}
        aria-label="Previous"
        icon="ArrowLeft"
        disabled={leftDisabled}
      />
      <Button
        onClick={() => {
          scroll();
        }}
        aria-label="Next"
        icon="ArrowRight"
        disabled={rightDisabled}
      />
    </Wrapper>
  );
};
