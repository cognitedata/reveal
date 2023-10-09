import React, { useState } from 'react';

import {
  Chip,
  Button,
  Detail,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Tooltip,
} from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { pushMetric } from '../../../../utils/pushMetric';

export const BulkActionMenu = ({
  selectedCount,
  maxSelectCount,
  onDownload,
  onContextualise,
  onReview,
  onBulkEdit,
  onDelete,
  onTrainModel,
  handleCancelOtherEdits,
  style,
  processingFiles,
}: {
  selectedCount?: number;
  maxSelectCount?: number;
  onDownload?: () => void;
  onContextualise?: () => void;
  onReview?: () => void;
  onBulkEdit?: () => void;
  onDelete?: (setIsDeletingState: (val: boolean) => void) => void;
  onTrainModel?: () => void;
  handleCancelOtherEdits: () => void;
  style?: any;
  processingFiles?: boolean;
}) => {
  const [bulkActionInProgress, setBulkActionInProgress] =
    useState<boolean>(false);

  const count = selectedCount ? `[${selectedCount}]` : null;
  const inLimit =
    selectedCount && maxSelectCount ? selectedCount <= maxSelectCount : true;
  const exceededLimitMessage = `Total number of files that can be processed simultaneously is ${maxSelectCount}`;

  const visionMLEnabled = useFlag('VISION_ML', {
    fallback: false,
    forceRerender: true,
  });

  const visionAutoMLEnabled = useFlag('VISION_AutoML', {
    fallback: false,
    forceRerender: true,
  });

  const showAlphaBadge = (
    <Tooltip
      wrapped
      content="This feature is in alpha and in limited availability"
    >
      <Chip
        type="warning"
        label="alpha"
        size="x-small"
        style={{ marginLeft: '5px' }}
        hideTooltip
      />
    </Tooltip>
  );

  const MenuContent = (
    <Menu
      onClick={() => {
        pushMetric('Vision.BulkAction');
      }}
    >
      {onBulkEdit && (
        <Menu.Item
          onClick={() => {
            onBulkEdit();
            handleCancelOtherEdits();
          }}
          icon="Document"
          iconPlacement="left"
        >
          Bulk Edit Data {count}
        </Menu.Item>
      )}
      {onReview && (
        <Menu.Item
          onClick={onReview}
          disabled={!count}
          icon="Edit"
          iconPlacement="left"
        >
          Review {count}
        </Menu.Item>
      )}
      {onDownload && (
        <Menu.Item
          onClick={onDownload}
          disabled={
            processingFiles !== undefined ? !count || processingFiles : !count
          }
          icon="Download"
          iconPlacement="left"
        >
          Download {count}
        </Menu.Item>
      )}
      {onDelete && (
        <Popconfirm
          icon="WarningFilled"
          placement="bottom-end"
          onConfirm={() => onDelete(setBulkActionInProgress)}
          content="Are you sure you want to permanently delete this file?"
          disabled={
            processingFiles !== undefined ? !count || processingFiles : !count
          }
        >
          <Menu.Item
            disabled={
              processingFiles !== undefined ? !count || processingFiles : !count
            }
            icon="Delete"
            iconPlacement="left"
          >
            Delete {count}
          </Menu.Item>
        </Popconfirm>
      )}
      {visionMLEnabled && onContextualise && (
        <Menu.Item
          onClick={onContextualise}
          disabled={!count || !inLimit}
          icon="Scan"
          iconPlacement="left"
        >
          <Tooltip
            content={
              <span data-testid="text-content">{exceededLimitMessage}</span>
            }
            disabled={!!inLimit}
          >
            <div style={{ display: 'flex', marginRight: 17 }}>
              Contextualize {count}
              {showAlphaBadge}
            </div>
          </Tooltip>
        </Menu.Item>
      )}
      {visionAutoMLEnabled && onTrainModel && (
        <Menu.Item
          onClick={onTrainModel}
          disabled={!count}
          icon="Network"
          iconPlacement="left"
        >
          Train Model {count} {showAlphaBadge}
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div style={style}>
      <Dropdown content={MenuContent}>
        <Button
          type="primary"
          icon="ChevronDownSmall"
          disabled={!count || bulkActionInProgress}
          iconPlacement="right"
          style={{ marginLeft: 14 }}
          loading={bulkActionInProgress}
        >
          Bulk Edit {count}
        </Button>
      </Dropdown>
    </div>
  );
};
