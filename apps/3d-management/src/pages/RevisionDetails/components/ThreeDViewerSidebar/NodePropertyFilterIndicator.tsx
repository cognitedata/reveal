import React, { CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { setNodePropertyFilter } from 'store/modules/toolbar';
import { Tag, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';

type Props = {
  style?: CSSProperties;
};

export function NodePropertyFilterIndicator({ style = {} }: Props) {
  const dispatch = useDispatch();
  const { value: filterValue, isLoading } = useSelector(
    (state: RootState) => state.toolbar.nodePropertyFilter
  );

  if (!filterValue) {
    return <div style={style} />;
  }

  const getFilterLabel = (): string => {
    const filterKey = Object.keys(filterValue)[0];
    const [key, val] = Object.entries(filterValue[filterKey])[0];
    return `${key}: ${val}`;
  };

  return (
    <Tooltip content={`Filter: ${JSON.stringify(filterValue)}`}>
      <Tag
        closable
        onClose={() => dispatch(setNodePropertyFilter(null))}
        color="midblue"
        ghost
        style={style}
      >
        <TextEllipsis>
          {isLoading ? 'Loading filter...' : getFilterLabel()}
        </TextEllipsis>
      </Tag>
    </Tooltip>
  );
}

const TextEllipsis = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
`;
