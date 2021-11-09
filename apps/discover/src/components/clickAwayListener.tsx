import { useRef } from 'react';

import { useClickAwayListener } from 'hooks/useClickAwayListener';

interface Props {
  children: React.ReactNode;
  onClickAway: (ev: Event) => void;
}

export const ClickAwayListener: React.FC<Props> = ({
  onClickAway: clickOutside,
  children,
}) => {
  const wrapperRef = useRef<HTMLHeadingElement | null>(null);
  useClickAwayListener(wrapperRef, clickOutside);

  return <div ref={wrapperRef}>{children}</div>;
};

export default ClickAwayListener;
