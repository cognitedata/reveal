import React from 'react';
import icons, { IconType } from 'assets/icons';

type Props = {
  icon: IconType;
  style?: React.CSSProperties;
};

export const CustomIcon = ({ icon, style = {} }: Props) => {
  const src = icons[icon];

  return <img src={src} alt={`icon-${icon}`} style={style} />;
};
