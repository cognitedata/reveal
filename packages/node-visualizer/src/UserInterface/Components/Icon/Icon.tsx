import React from 'react';

import { getIcon } from '../../../UserInterface/Components/Icon/IconSelector';
import { ToolbarToolTip } from '../../../UserInterface/Components/ToolbarToolTip/ToolbarToolTip';
import { IconTypes } from '../../../UserInterface/Components/Icon/IconTypes';

interface IconProps {
  type?: IconTypes;
  name?: string;
  src?: string;
  tooltip?: {
    text: string;
    placement?: 'bottom' | 'right-start';
  };
  iconSize?: { width: number; height: number };
}

export const Icon = (props: IconProps) => {
  const { type, name, src, tooltip, iconSize } = props;
  // TODO - Remove getIcon once Settings implementation complete
  const imgSrc = src || (type && name ? getIcon(type, name) : '');
  const style = iconSize
    ? { width: iconSize.width, height: iconSize.height }
    : {};

  const image = <img src={imgSrc} style={style} alt={name} />;

  return (
    <ToolbarToolTip
      type={type}
      name={name}
      src={src}
      tooltip={tooltip}
      iconSize={iconSize}
    >
      {image}
    </ToolbarToolTip>
  );
};
