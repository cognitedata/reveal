import * as React from 'react';

import { Menu } from '@cognite/cogs.js';
import { EmptyStateText } from '../elements';

export interface FilterEmptyStateProps {
  text?: string;
}

export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  text = 'No options',
}) => {
  return (
    <Menu>
      <Menu.Item>
        <EmptyStateText>{text}</EmptyStateText>
      </Menu.Item>
    </Menu>
  );
};
