import * as React from 'react';

import { EmptyStateText } from '../elements';

export interface FilterEmptyStateProps {
  text?: string;
}

// TODO: Change the layout of the empty state
export const FilterEmptyState: React.FC<FilterEmptyStateProps> = ({
  text = 'No options',
}) => {
  return <EmptyStateText>{text}</EmptyStateText>;
};
