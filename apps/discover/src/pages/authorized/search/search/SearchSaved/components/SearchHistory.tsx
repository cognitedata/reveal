import React from 'react';

import { pluralize } from 'utils/pluralize';

import { Flex, Icon, Tooltip } from '@cognite/cogs.js';

import { MiddleEllipsis } from 'components/MiddleEllipsis/MiddleEllipsis';
import { NewLine } from 'styles/layout';

import { FILTER_END_MARKER, NO_FILTERS } from '../constants';
import {
  Filters,
  IconWrapper,
  SearchContainer,
  SearchHistoryRow,
  SearchPhrase,
} from '../elements';
import { SearchHistoryFilter } from '../types';

interface Props {
  query?: string;
  filters: SearchHistoryFilter[];
  count: number;
}

const renderSearchHistoryLabel = (count: number) => {
  if (count === 0) {
    return NO_FILTERS;
  }

  return (
    <Flex gap={4}>
      {`${count} ${pluralize('filter', count)} applied `}
      <Icon type="Info" data-testid="search-history-info" />
    </Flex>
  );
};

const renderTooltipContent = (filters: SearchHistoryFilter[]) => {
  return filters.map(({ label, values }, index) => {
    const filtersAsString = values?.join(FILTER_END_MARKER);

    if (!filtersAsString) {
      return null;
    }

    const showNewLine = filters[index + 1]?.values.length > 0;

    return (
      <React.Fragment key={label}>
        <span>{filtersAsString}</span>
        {showNewLine && <NewLine />}
      </React.Fragment>
    );
  });
};

export const SearchHistory: React.FC<Props> = ({ query, filters, count }) => {
  return (
    <SearchHistoryRow>
      <SearchContainer>
        <SearchPhrase>
          <MiddleEllipsis value={query || ''} />
        </SearchPhrase>
        <Tooltip
          disabled={count === 0}
          content={renderTooltipContent(filters)}
          wrapped
          placement="bottom-end"
        >
          <Filters data-testid="search-history-filters">
            {renderSearchHistoryLabel(count)}
          </Filters>
        </Tooltip>
      </SearchContainer>

      <IconWrapper>
        <Icon type="History" />
      </IconWrapper>
    </SearchHistoryRow>
  );
};
