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

import { useTranslation } from '@data-exploration-lib/core';
import { queryKeys } from '@data-exploration-lib/domain-layer';

import { useFlagIndustryCanvas } from '../../hooks/flags/useFlagIndustryCanvas';
import { getSearchParams } from '../../utils/URLUtils';

type CanvasButtonProps = {
  item: ResourceItem;
};

const CanvasButton: React.FC<CanvasButtonProps> = ({ item }) => {
  const { t } = useTranslation();
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
    <Tooltip
      content={t('OPEN_IN_INDUSTRIAL_CANVAS', 'Open in Industrial Canvas')}
    >
      <Link
        to={createLink(`/industrial-canvas`, {
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
