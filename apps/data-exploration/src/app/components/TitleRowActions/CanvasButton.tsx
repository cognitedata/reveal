import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  isSupportedResourceItem as isSupportedResourceItemHelper,
  resourceItemToContainerReference,
  readOpenedCanvases,
  OpenedCanvas,
  addPendingContainerReference,
} from '@fusion/industry-canvas';
import { useQuery } from '@tanstack/react-query';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';
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
  const [openedCanvases, setOpenedCanvases] = useState<OpenedCanvas[]>([]);
  const isIndustryCanvasEnabled = useFlagIndustryCanvas();

  const { data: isSupportedResourceItem = false } = useQuery(
    queryKeys.supportedResourceItem(item),
    () => isSupportedResourceItemHelper(sdk, item)
  );

  useEffect(() => {
    setOpenedCanvases(readOpenedCanvases());

    const readOpenedCanvasesToState = () => {
      setOpenedCanvases(readOpenedCanvases());
    };

    window.addEventListener('storage', readOpenedCanvasesToState);

    return () => {
      window.removeEventListener('storage', readOpenedCanvasesToState);
    };
  }, []);

  if (!isIndustryCanvasEnabled) {
    return null;
  }

  if (!isSupportedResourceItem) {
    return null;
  }

  const initializeWithContainerReferences = btoa(
    JSON.stringify([resourceItemToContainerReference(item)])
  );

  if (openedCanvases.length === 0) {
    return (
      <Tooltip
        content={t('OPEN_IN_INDUSTRIAL_CANVAS', 'Open in Industrial Canvas')}
      >
        <Link
          to={createLink(`/industrial-canvas`, {
            ...getSearchParams(window.location.search),
            initializeWithContainerReferences,
          })}
          aria-label={t(
            'OPEN_IN_INDUSTRIAL_CANVAS',
            'Open in Industrial Canvas'
          )}
        >
          <Button icon="Canvas" />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Dropdown
      content={
        <Menu>
          <Menu.Item
            href={createLink(`/industrial-canvas`, {
              ...getSearchParams(window.location.search),
              initializeWithContainerReferences,
            })}
            aria-label={t('CHOOSE_CANVAS', 'Choose canvas...')}
          >
            {t('CHOOSE_CANVAS', 'Choose canvas...')}
          </Menu.Item>

          <Menu.Section
            icon="ListAdd"
            label={t('OPEN_CANVASES', 'Open canvases')}
          >
            {openedCanvases.map((openedCanvas) => (
              <Menu.Item
                key={openedCanvas.externalId}
                onClick={() =>
                  addPendingContainerReference({
                    canvasExternalId: openedCanvas.externalId,
                    containerReference: resourceItemToContainerReference(item),
                  })
                }
              >
                {openedCanvas.name}
              </Menu.Item>
            ))}
          </Menu.Section>
        </Menu>
      }
      openOnHover={false}
    >
      <Button
        icon="Canvas"
        aria-label={t('OPEN_IN_INDUSTRIAL_CANVAS', 'Open in Industrial Canvas')}
      />
    </Dropdown>
  );
};

export default CanvasButton;
