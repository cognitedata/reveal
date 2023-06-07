/**
 *
 * @returns ShowHideButton
 */

import { MouseEventHandler } from 'react';

import { Button } from '@cognite/cogs.js';

interface Props {
  enabled: boolean;
  onClick: () => void;
}

export const ShowHideButton = ({ enabled, onClick }: Props) => {
  return (
    <Button
      icon={enabled ? 'EyeShow' : 'EyeHide'}
      onClick={() => onClick()}
      title="Toggle visibility"
      style={{
        marginLeft: 7,
        marginRight: 20,
        verticalAlign: 'middle',
      }}
    />
  );
};
