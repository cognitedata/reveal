import React, { useEffect } from 'react';

import {
  useResourceFilter,
  useQuery,
} from 'app/context/ResourceSelectionContext';
import { useResourceResults, convertResourceType } from 'lib';
import { useCurrentResourceId, useCurrentResourceType } from './hooks';

export default function RedirectToFirstId() {
  const [currentResourceType] = useCurrentResourceType();
  const [currentId, openPreview] = useCurrentResourceId();
  const [query] = useQuery();
  const filter = useResourceFilter(currentResourceType);
  const { isFetched, items } = useResourceResults(
    convertResourceType(currentResourceType),
    query,
    filter
  );

  useEffect(() => {
    if (!currentId && isFetched && items && items.length > 0) {
      openPreview(items[0].id, true);
    }
  }, [
    currentId,
    currentResourceType,
    query,
    filter,
    items,
    isFetched,
    openPreview,
  ]);

  return <></>;
}
