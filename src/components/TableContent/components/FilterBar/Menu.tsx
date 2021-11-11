import React from 'react';
import styled from 'styled-components';
import { Body, Button, Colors, Flex } from '@cognite/cogs.js';

export const Menu = (): JSX.Element => {
  const onFiltersClick = () => {
    /** do something */
  };
  const onExpandClick = () => {
    /** do something */
  };
  const onMenuClick = () => {
    /** do something */
  };

  return (
    <Bar alignItems="center" justifyContent="space-between">
      <Button
        icon="Filter"
        size="small"
        variant="ghost"
        onClick={onFiltersClick}
      >
        Filters
      </Button>
      <Button
        icon="ExpandMax"
        size="small"
        variant="ghost"
        onClick={onExpandClick}
      />
      <Button
        icon="HorizontalEllipsis"
        size="small"
        variant="ghost"
        onClick={onMenuClick}
      />
    </Bar>
  );
};

type Direction = 'prev' | 'next';
export const Pagination = (): JSX.Element => {
  const range = [0, 500];
  const [start, end] = range;

  const onPaginationClick = (_direction: Direction) => {
    /** do something */
  };
  return (
    <Bar alignItems="center" justifyContent="space-between">
      <Button
        icon="ChevronLeftCompact"
        size="small"
        variant="ghost"
        onClick={() => onPaginationClick('prev')}
      />
      <Body level={1} strong>
        Showing {start} - {end}
      </Body>
      <Button
        icon="ChevronRightCompact"
        size="small"
        variant="ghost"
        onClick={() => onPaginationClick('next')}
      />
    </Bar>
  );
};

const Bar = styled(Flex)`
  border-left: 1px solid ${Colors['greyscale-grey4'].hex()};
  & > * {
    margin: 0 4px;
  }
`;
