import React from 'react';
import styled from 'styled-components';
import { Body, Button, Flex, Input } from '@cognite/cogs.js';
import { Separator } from 'components/Separator';
import { FILTER_BAR_HEIGHT } from 'utils/constants';
import { activeFilters } from './mock';
import { Actions } from './Actions';

export type FilterType = { type: string; value: number };

type Props = { isEmpty?: boolean };
export const FilterBar = ({ isEmpty }: Props): JSX.Element => {
  const onFilterClick = (_filter: FilterType) => {
    /** do something */
  };

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <FilterBar.List justifyContent="center" alignItems="center">
        {!isEmpty && (
          <>
            <Input placeholder="Search columns, values" />
            <Separator style={{ margin: '0 12px' }} />
            {activeFilters.map((filter: FilterType) => (
              <Button type="tertiary" onClick={() => onFilterClick(filter)}>
                {filter.value} {filter.type}
              </Button>
            ))}
          </>
        )}
      </FilterBar.List>
      <Flex justifyContent="center" alignItems="center">
        <Separator style={{ margin: '0 12px' }} />
        <Body level={2} strong>
          12345 rows
        </Body>
        <Separator style={{ margin: '0 12px' }} />
        <FilterBar.Actions />
      </Flex>
    </Bar>
  );
};

const Bar = styled(Flex)`
  padding: 16px;
  height: ${FILTER_BAR_HEIGHT}px;
  box-sizing: border-box;
`;

const List = styled(Flex)`
  & > :not(:first-child) {
    margin-right: 8px;
  }
`;

FilterBar.List = List;
FilterBar.Actions = Actions;
