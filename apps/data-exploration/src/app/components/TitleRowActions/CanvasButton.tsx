import React from 'react';
import { Link } from 'react-router-dom';

import {
  isSupportedResourceItem as isSupportedResourceItemHelper,
  resourceItemToContainerReference,
} from '@fusion/industry-canvas';
import { useQuery } from '@tanstack/react-query';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Tooltip } from '@cognite/cogs.js';
import { ResourceItem } from '@cognite/data-exploration';
import { useSDK } from '@cognite/sdk-provider';

import { useFlagIndustryCanvas } from '@data-exploration-app/hooks/flags/useFlagIndustryCanvas';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';
import { queryKeys } from '@data-exploration-lib/domain-layer';

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
    <Tooltip content="Open in Industrial Canvas">
      <Link
        to={createLink(`/industrial-canvas/canvas`, {
          ...getSearchParams(window.location.search),
          initializeWithContainerReferences,
        })}
        aria-label="Open in Industrial Canvas"
      >
        <Button icon="Canvas" />
      </Link>
    </Tooltip>
  );
};

export default CanvasButton;
