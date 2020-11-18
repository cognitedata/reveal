import React from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import { HeaderGroup } from 'react-table';
import styled from 'styled-components';

interface OwnProps<T extends object> {
  sCol: HeaderGroup<T>;
}

const SortingIcon = styled((props) => <Icon {...props} />)`
  margin-left: 0.25rem;
  vertical-align: middle;
  path {
    fill: ${Colors['greyscale-grey6'].hex()};
  }
`;

const SorterIndicator = <T extends object>({ sCol }: OwnProps<T>) => {
  if (!sCol.disableSortBy) {
    if (sCol.isSorted) {
      if (sCol.isSortedDesc) {
        return <SortingIcon type="SortDown" />;
      }
      return <SortingIcon type="SortUp" />;
    }
    return <SortingIcon type="OrderDesc" />;
  }
  return <></>;
};

export default SorterIndicator;
