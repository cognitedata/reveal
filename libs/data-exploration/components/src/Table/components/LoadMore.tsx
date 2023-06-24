import React from 'react';

import noop from 'lodash/noop';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

export type LoadMoreProps = {
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  fetchMore?: (...args: any[]) => any;
  text?: string;
};

export const LoadMore: React.FC<LoadMoreProps> = ({
  hasNextPage = false,
  isLoadingMore = false,
  text,
  fetchMore = noop,
  ...rest
}) => {
  const { t } = useTranslation();

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
      {text || t('LOAD_MORE', 'Load More')}
    </Button>
  );
};
