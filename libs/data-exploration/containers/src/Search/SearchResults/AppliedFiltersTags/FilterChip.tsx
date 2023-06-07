import React from 'react';

import styled from 'styled-components';

import includes from 'lodash/includes';

import { IconType, Chip } from '@cognite/cogs.js';

import { COMMON_FILTER_KEYS } from '@data-exploration-lib/core';

import { getTitle } from './utils';

export interface FilterChipProps {
  name: string;
  value: string;
  icon?: IconType;
  formatName?: boolean;
  onClick?: () => void;
}
export const FilterChip: React.FC<FilterChipProps> = ({
  name,
  value,
  icon,
  formatName = true,
  onClick,
}) => {
  const isCommonKeyName = includes(COMMON_FILTER_KEYS, name);

  const variant = isCommonKeyName ? 'neutral' : 'success';
  const text = `${formatName ? getTitle(name) : name}: ${value}`;

  return (
    <StyledChip
      data-testid="filter-chip"
      type={variant}
      selectable={Boolean(onClick)}
      size="small"
      icon={isCommonKeyName ? undefined : icon}
      label={text}
      {...(onClick ? { onRemove: onClick } : {})}
    />
  );
};

const StyledChip = styled(Chip)`
  .JoyChip-label {
    align-items: center;
  }
`;
