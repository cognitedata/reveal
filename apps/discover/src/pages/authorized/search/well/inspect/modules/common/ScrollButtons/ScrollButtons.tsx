import React, { useEffect, useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { Wrapper } from './elements';
import { getScrollDisabledStatus, scrollLeft, scrollRight } from './utils';

interface Props {
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const ScrollButtons: React.FC<Props> = ({ scrollRef }) => {
  const [leftDisabled, setLeftDisabled] = useState(false);
  const [rightDisabled, setRightDisabled] = useState(false);

  const handleOnScroll = () => {
    const { leftDisabled, rightDisabled } = getScrollDisabledStatus(scrollRef);
    setLeftDisabled(leftDisabled);
    setRightDisabled(rightDisabled);
  };

  useEffect(() => {
    // Give some time to update scroll element reference
    setTimeout(handleOnScroll, 1000);
    scrollRef.current?.addEventListener('scroll', handleOnScroll);
    return () =>
      scrollRef.current?.removeEventListener('scroll', handleOnScroll);
  }, []);

  return (
    <Wrapper>
      <Button
        onClick={() => scrollLeft(scrollRef)}
        aria-label="Previous"
        icon="ArrowLeft"
        disabled={leftDisabled}
      />
      <Button
        onClick={() => scrollRight(scrollRef)}
        aria-label="Next"
        icon="ArrowRight"
        disabled={rightDisabled}
      />
    </Wrapper>
  );
};
