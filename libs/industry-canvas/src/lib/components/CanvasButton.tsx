import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import {
  type ResourceItem,
  getSearchParams,
  useTranslation,
} from '@data-exploration-lib/core';
import { queryKeys } from '@data-exploration-lib/domain-layer';

import { translationKeys } from '../common';
import {
  type OpenedCanvas,
  readOpenedCanvases,
  addPendingContainerReference,
} from '../hooks/useLocalStorageCommunication';
import isSupportedResourceItemHelper from '../utils/isSupportedResourceItem';
import resourceItemToContainerReference from '../utils/resourceItemToContainerReference';

type CanvasButtonProps = {
  item: ResourceItem;
};

const CanvasButton: React.FC<CanvasButtonProps> = ({ item }) => {
  const { t } = useTranslation();
  const sdk = useSDK();
  const [openedCanvases, setOpenedCanvases] = useState<OpenedCanvas[]>([]);

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

  if (!isSupportedResourceItem) {
    return null;
  }

  const initializeWithContainerReferences = btoa(
    JSON.stringify([resourceItemToContainerReference(item)])
  );

  if (openedCanvases.length === 0) {
    return (
      <Tooltip
        content={t(
          translationKeys.CANVAS_BUTTON_OPEN_IN_INDUSTRIAL_CANVAS,
          'Open in Industrial Canvas'
        )}
      >
        <Link
          to={createLink(`/industrial-canvas`, {
            ...getSearchParams(window.location.search),
            initializeWithContainerReferences,
          })}
          aria-label={t(
            translationKeys.CANVAS_BUTTON_OPEN_IN_INDUSTRIAL_CANVAS,
            'Open in Industrial Canvas'
          )}
        >
          <Button icon="Canvas" />
        </Link>
      </Tooltip>
    );
  }

  return (
    <Tooltip
      content={t(
        translationKeys.CANVAS_BUTTON_OPEN_IN_INDUSTRIAL_CANVAS,
        'Open in Industrial Canvas'
      )}
    >
      <Dropdown
        content={
          <Menu>
            <Menu.Item
              href={createLink(`/industrial-canvas`, {
                ...getSearchParams(window.location.search),
                initializeWithContainerReferences,
              })}
              aria-label={t(
                translationKeys.CANVAS_BUTTON_CHOOSE_CANVAS,
                'Choose canvas...'
              )}
            >
              {t(
                translationKeys.CANVAS_BUTTON_CHOOSE_CANVAS,
                'Choose canvas...'
              )}
            </Menu.Item>

            <Menu.Section
              icon="ListAdd"
              label={t(
                translationKeys.CANVAS_BUTTON_OPEN_CANVASES,
                'Open canvases'
              )}
            >
              {openedCanvases.map((openedCanvas) => (
                <Menu.Item
                  key={openedCanvas.externalId}
                  onClick={() =>
                    addPendingContainerReference({
                      canvasExternalId: openedCanvas.externalId,
                      containerReference:
                        resourceItemToContainerReference(item),
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
          aria-label={t(
            translationKeys.CANVAS_BUTTON_OPEN_IN_INDUSTRIAL_CANVAS,
            'Open in Industrial Canvas'
          )}
        />
      </Dropdown>
    </Tooltip>
  );
};

export default CanvasButton;
