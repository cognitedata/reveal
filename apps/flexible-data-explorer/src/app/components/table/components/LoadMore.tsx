import React from 'react';
import { Button } from '@cognite/cogs.js';
import noop from 'lodash/noop';

export type LoadMoreProps = {
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  fetchMore?: (...args: any[]) => any;
  text?: string;
};

export const LoadMore: React.FC<LoadMoreProps> = ({
  hasNextPage = false,
  isLoadingMore = false,
  text = 'Load More',
  fetchMore = noop,
  ...rest
}) => {
  if (!hasNextPage) {
    return null;
  }

  return (
    <Button
      type="secondary"
      loading={isLoadingMore}
      onClick={() => fetchMore()}
      {...rest}
    >
      {text}
    </Button>
  );
};
