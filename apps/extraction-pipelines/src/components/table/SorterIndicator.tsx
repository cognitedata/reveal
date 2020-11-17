import React, { FunctionComponent } from 'react';
import { Colors, Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

interface OwnProps {
  sCol: any;
}

type Props = OwnProps;

const SortingIcon = styled((props) => <Icon {...props} />)`
  margin-left: 0.25rem;
  vertical-align: middle;
  path {
    fill: ${Colors['greyscale-grey6'].hex()};
  }
`;

const SorterIndicator: FunctionComponent<Props> = ({ sCol }: Props) => {
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
