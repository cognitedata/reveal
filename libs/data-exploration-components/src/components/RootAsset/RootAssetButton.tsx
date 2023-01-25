import * as React from 'react';

import { Button, Icon } from '@cognite/cogs.js';

import { RootAssetLabel, RootAssetButtonWrapper } from './elements';

export interface RootAssetButtonProps {
  label: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  externalLink?: boolean;
}

export const RootAssetButton: React.FC<RootAssetButtonProps> = ({
  label,
  onClick,
  externalLink = true,
}) => {
  return (
    <RootAssetButtonWrapper
      className="cogs-btn cogs-btn-link"
      role="button"
      onClick={onClick}
    >
      <RootAssetLabel>{label}</RootAssetLabel>
      <div>
        <Icon type={externalLink ? 'ArrowUpRight' : 'ArrowRight'} />
      </div>
    </RootAssetButtonWrapper>
  );
};
