import React from 'react';
import { Button, ButtonProps } from '@cognite/cogs.js';

export interface LoadMoreProps extends ButtonProps {
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  fetchMore?: Function;
  text?: string;
}
export const LoadMore: React.FC<LoadMoreProps> = props => {
  const {
    hasNextPage = false,
    isLoadingMore = false,
    text = 'Load More',
    fetchMore = () => {},
    ...rest
  } = props;

  return hasNextPage ? (
    <Button
      type="tertiary"
      loading={isLoadingMore}
      onClick={() => fetchMore()}
      {...rest}
    >
      {text}
    </Button>
  ) : null;
};
