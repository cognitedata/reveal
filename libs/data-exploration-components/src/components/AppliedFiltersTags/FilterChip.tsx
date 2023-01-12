import { IconType, Tooltip } from '@cognite/cogs.js';
import { COMMON_FILTER_KEYS } from '@data-exploration-lib/domain-layer';

import includes from 'lodash/includes';
import React from 'react';

import { CloseButton, StyledChip, Title } from './elements';
import { getTitle } from './utils';

export interface Props {
  name: string;
  value: string;
  icon?: IconType;
  formatName?: boolean;
  onClick?: () => void;
}
export const FilterChip: React.FC<Props> = ({
  name,
  value,
  icon,
  formatName = true,
  onClick,
}) => {
  const isCommonKeyName = includes(COMMON_FILTER_KEYS, name);

  const variant = isCommonKeyName ? 'normal' : 'success';
  const text = `${formatName ? getTitle(name) : name}: ${value}`;

  return (
    <Tooltip content={text}>
      <StyledChip
        variant={variant}
        onClick={onClick}
        selectable={Boolean(onClick)}
        size="medium"
        icon={isCommonKeyName ? undefined : icon}
        data-testid="filter-chip"
      >
        <Title>{text}</Title>
        {Boolean(onClick) && <CloseButton onClick={onClick} />}
      </StyledChip>
    </Tooltip>
  );
};
