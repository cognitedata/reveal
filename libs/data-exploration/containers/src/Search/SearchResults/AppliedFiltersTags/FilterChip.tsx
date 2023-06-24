import React from 'react';

import styled from 'styled-components';

import includes from 'lodash/includes';

import { IconType, Chip } from '@cognite/cogs.js';

import { COMMON_FILTER_KEYS, useTranslation } from '@data-exploration-lib/core';

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
  const { t } = useTranslation();

  const isCommonKeyName = includes(COMMON_FILTER_KEYS, name);

  const variant = isCommonKeyName ? 'neutral' : 'success';
  const title = formatName ? getTitle(name) : name;

  /**
   * Since we get the titles from `CUSTOM_FILTER_TITLE` and
   * we have included them in upper-case form as translation keys.
   */
  const translationKey = title.toUpperCase().replace(/ /g, '_');
  const text = `${t(translationKey, title)}: ${value}`;

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
