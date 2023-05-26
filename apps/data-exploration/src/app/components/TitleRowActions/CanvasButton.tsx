import React from 'react';
import { Link } from 'react-router-dom';

import { useFlagIndustryCanvas } from '@data-exploration-app/hooks/flags/useFlagIndustryCanvas';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import {
  isSupportedResourceItem as isSupportedResourceItemHelper,
  resourceItemToContainerReference,
} from '@fusion/industry-canvas';
import { useQuery } from '@tanstack/react-query';

import { createLink } from '@cognite/cdf-utilities';
import { Chip, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';

type CanvasButtonProps = {
  item: ResourceItem;
};

const CanvasButton: React.FC<CanvasButtonProps> = ({ item }) => {
  const sdk = useSDK();
  const isIndustryCanvasEnabled = useFlagIndustryCanvas();

  const { data: isSupportedResourceItem = false } = useQuery(
    queryKeys.supportedResourceItem(item),
    () => isSupportedResourceItemHelper(sdk, item)
  );

  if (!isIndustryCanvasEnabled) {
    return null;
  }

  if (!isSupportedResourceItem) {
    return null;
  }

  const initializeWithContainerReferences = btoa(
    JSON.stringify([resourceItemToContainerReference(item)])
  );

  return (
    <Tooltip content="Open in Industry Canvas">
      <Link
        to={createLink(`/explore/industryCanvas`, {
          ...getSearchParams(window.location.search),
          initializeWithContainerReferences,
        })}
        aria-label="Open in Industry Canvas"
      >
        <Chip icon="Canvas" />
      </Link>
    </Tooltip>
  );
};

export default CanvasButton;
