import React from 'react';

import styled from 'styled-components';

import { Chip, Colors, Flex } from '@cognite/cogs.js';

import { TranslationKeys, useTranslation } from '../../../i18n';

import { SearchResourceType, SearchResourceProps } from './GlobalSearchMenu';

type ResourceLabelGroupProps = {
  appliedFilters: SearchResourceType[];
  onToggleFilter: (filter: SearchResourceType) => void;
  onReset: () => void;
  resources: Record<SearchResourceType, SearchResourceProps>;
};

export const ResourcesLabelGroup = ({
  appliedFilters,
  onToggleFilter,
  onReset,
  resources,
}: ResourceLabelGroupProps) => {
  const { t } = useTranslation();

  const getVariant = (filter: SearchResourceType) =>
    appliedFilters.includes(filter) ? 'neutral' : undefined;

  const handleResourceClick = (
    type: SearchResourceType,
    count: number | undefined
  ) => {
    if (!count) return;
    onToggleFilter(type);
  };

  return (
    <StyledContainer direction="column">
      <Flex gap={4}>
        {Object.keys(resources).map((item) => {
          const resourceKey = item as SearchResourceType;
          const resource = resources[resourceKey];
          const isFilter = resource.count > 0;

          if (!isFilter) return null;

          return (
            <StyledChipContainer>
              <StyledChip
                key={`${resourceKey}-filter`}
                icon={resource.icon}
                size="small"
                type={getVariant(resourceKey)}
                $disabled={!isFilter}
                onClick={
                  isFilter
                    ? () => handleResourceClick(resourceKey, resource.count)
                    : undefined
                }
                label={t(item as TranslationKeys)}
                appearance="outlined"
              />
            </StyledChipContainer>
          );
        })}
        {appliedFilters?.length > 0 && (
          <StyledChipContainer>
            <Chip
              icon="ClearAll"
              size="small"
              onClick={onReset}
              label={t('clear')}
              appearance="outlined"
            />
          </StyledChipContainer>
        )}
      </Flex>
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex)`
  padding: 0 16px;
`;

// button inside chip component does not get width in firefox, added a workaround for now
const StyledChipContainer = styled.div`
  padding: 16px 0;
  [type='button'] {
    width: 100% !important;
  }
`;

const StyledChip = styled(Chip)<{ $disabled?: boolean }>`
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  &:hover {
    background-color: ${({ $disabled }) =>
      $disabled ? Colors['surface--interactive--disabled'] : 'none'};
  }
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
`;
