/**
 *
 * @returns ShowHideButton
 */

import { MouseEvent } from 'react';

import { Button } from '@cognite/cogs.js';

interface Props {
  enabled: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const ShowHideButton = ({ enabled, onClick }: Props) => {
  return (
    <Button
      icon={enabled ? 'EyeShow' : 'EyeHide'}
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
