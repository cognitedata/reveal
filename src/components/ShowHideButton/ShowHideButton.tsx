/**
 *
 * @returns ShowHideButton
 */

import { Icon } from '@cognite/cogs.js';
import { MouseEventHandler } from 'react';

export interface ShowHideButtonProps {
  enabled: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export const ShowHideButton = ({ enabled, onClick }: ShowHideButtonProps) => {
  return (
    <Icon
      type={enabled ? 'EyeShow' : 'EyeHide'}
      onClick={(event) => onClick(event)}
      title="Toggle visibility"
      style={{
        marginLeft: 7,
        marginRight: 20,
        verticalAlign: 'middle',
      }}
    />
  );
};
