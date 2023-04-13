import * as React from 'react';

import { Flex, Icon } from '@cognite/cogs.js';

import { RootAssetLabel, RootAssetButtonWrapper } from './elements';

export interface RootAssetButtonProps {
  label: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export const RootAssetButton: React.FC<RootAssetButtonProps> = ({
  label,
  onClick,
}) => {
  return (
    <RootAssetButtonWrapper
      className="cogs cogs-button cogs-button--size-small cogs-button--align-vertically-left cogs-button--type-ghost-accent cogs-button--size-medium cogs-button--icon-right cogs cogs-link"
      role="button"
      onClick={onClick}
    >
      <RootAssetLabel>{label}</RootAssetLabel>
      <Flex justifyContent="center" alignItems="center">
        <Icon type="ArrowRight" />
      </Flex>
    </RootAssetButtonWrapper>
  );
};
