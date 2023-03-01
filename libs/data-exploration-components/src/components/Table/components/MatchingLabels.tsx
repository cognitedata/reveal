import { Chip, ChipType, Flex, IconType, Tooltip } from '@cognite/cogs.js';
import { MatchingLabels } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { capitalizeFirstLetter } from '../../../utils';

const getMainTooltipContent = (title: string, items: string[]) => (
  <>
    {capitalizeFirstLetter(title)} match:
    <Ul>
      {items.map((item) => (
        <li key={item}>{capitalizeFirstLetter(item)}</li>
      ))}
    </Ul>
  </>
);

const getLabelFromMatchingItem = (title: string, items: string[]) =>
  `${capitalizeFirstLetter(title)} match: ${items
    .map((item) => capitalizeFirstLetter(item))
    .join(', ')}`;

const getFirstMatchingItem = ({
  exact,
  partial,
  fuzzy,
}: MatchingLabels):
  | {
      value: string[];
      match: 'exact' | 'partial' | 'fuzzy';
    }
  | undefined => {
  if (!isEmpty(exact)) {
    return { value: exact, match: 'exact' };
  }
  if (!isEmpty(partial)) return { value: partial, match: 'partial' };
  if (!isEmpty(fuzzy)) return { value: fuzzy, match: 'fuzzy' };
  return undefined;
};

const getRestMatchingItems = (data: MatchingLabels, firstItem?: string) => {
  if (!firstItem) return [];
  return Object.keys(data)
    .filter(
      (match) =>
        match !== firstItem && !isEmpty(data[match as keyof MatchingLabels])
    )
    .map((item) => {
      return { value: data[item as keyof MatchingLabels], match: item };
    });
};

export const MatchingLabelsComponent: React.FC<MatchingLabels> = (data) => {
  const firstMatchingItem = getFirstMatchingItem(data);
  const restMatchingItem = getRestMatchingItems(data, firstMatchingItem?.match);
  return (
    <StyledFlex gap={4}>
      {firstMatchingItem && (
        <Tooltip
          position="right"
          content={getMainTooltipContent(
            firstMatchingItem.match,
            firstMatchingItem.value
          )}
        >
          <Chip
            hideTooltip
            size="x-small"
            label={getLabelFromMatchingItem(
              firstMatchingItem.match,
              firstMatchingItem.value
            )}
            {...(firstMatchingItem.match === 'exact'
              ? { icon: 'MagicWand', type: 'success' }
              : {})}
          />
        </Tooltip>
      )}
      {restMatchingItem.length > 0 && (
        <Tooltip
          position="right"
          content={
            <div>
              {restMatchingItem.map(({ value, match }) => (
                <React.Fragment key={match}>
                  {getMainTooltipContent(match, value)}
                </React.Fragment>
              ))}
            </div>
          }
        >
          <Chip
            hideTooltip
            size="x-small"
            label={`+${restMatchingItem.length}`}
          />
        </Tooltip>
      )}
    </StyledFlex>
  );
};

const Ul = styled.ul`
  margin: 0;
  padding-left: 22px;
`;

const StyledFlex = styled(Flex)`
  max-width: 80%;

  .cogs-tooltip__content {
    width: 100%;
  }
  .cogs-chip {
    width: 100%;
  }
`;
