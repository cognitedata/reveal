import React from 'react';

import styled from 'styled-components';

import isEmpty from 'lodash/isEmpty';

import { Chip, Flex, Tooltip } from '@cognite/cogs.js';

import {
  TFunction,
  capitalizeFirstLetter,
  useTranslation,
} from '@data-exploration-lib/core';
import { MatchingLabels } from '@data-exploration-lib/domain-layer';

const getMainTooltipContent = (
  title: string,
  items: string[],
  t: TFunction
) => {
  const type = capitalizeFirstLetter(title)!;

  return (
    <>
      {t('MATCHING_BY_TYPE', `${type} match`, { type })}:
      <Ul>
        {items.map((item) => (
          <li key={item}>{capitalizeFirstLetter(item)}</li>
        ))}
      </Ul>
    </>
  );
};

const getLabelFromMatchingItem = (
  title: string,
  items: string[],
  t: TFunction
) => {
  const type = capitalizeFirstLetter(title)!;
  const matches = items.map((item) => capitalizeFirstLetter(item)).join(', ');

  return t('MATCHING_LABEL_TITLE', `${type} match: ${matches}`, {
    type: t(title.toUpperCase(), type),
    matches,
  });
};

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
  const { t } = useTranslation();

  const firstMatchingItem = getFirstMatchingItem(data);
  const restMatchingItem = getRestMatchingItems(data, firstMatchingItem?.match);

  return (
    <StyledFlex gap={4}>
      {firstMatchingItem && (
        <Tooltip
          position="right"
          content={getMainTooltipContent(
            firstMatchingItem.match,
            firstMatchingItem.value,
            t
          )}
        >
          <Chip
            hideTooltip
            size="x-small"
            label={getLabelFromMatchingItem(
              firstMatchingItem.match,
              firstMatchingItem.value,
              t
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
                  {getMainTooltipContent(match, value, t)}
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

  .cogs-chip {
    width: 100%;
  }
`;
