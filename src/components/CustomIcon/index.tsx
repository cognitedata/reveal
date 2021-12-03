import React from 'react';
import icons, { IconType } from 'assets/icons';

type Props = {
  className?: string;
  icon: IconType;
  style?: React.CSSProperties;
};

export const CustomIcon = ({ className, icon, style = {} }: Props) => {
  const src = icons[icon];

  return (
    <img className={className} src={src} alt={`icon-${icon}`} style={style} />
  );
};
