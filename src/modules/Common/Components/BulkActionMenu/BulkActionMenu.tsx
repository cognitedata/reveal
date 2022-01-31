import React from 'react';
import {
  Button,
  Detail,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Tooltip,
} from '@cognite/cogs.js';
import { pushMetric } from 'src/utils/pushMetric';
import { useFlag } from '@cognite/react-feature-flags';

export const BulkActionMenu = ({
  selectedCount,
  maxSelectCount,
  onDownload,
  onContextualise,
  onReview,
  onBulkEdit,
  onDelete,
  onTrainModel,
  style,
  processingFiles,
}: {
  selectedCount?: number;
  maxSelectCount?: number;
  onDownload?: () => void;
  onContextualise?: () => void;
  onReview?: () => void;
  onBulkEdit?: () => void;
  onDelete?: () => void;
  onTrainModel?: () => void;
  style?: any;
  processingFiles?: boolean;
}) => {
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

  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
      onClick={() => {
        pushMetric('Vision.BulkAction');
      }}
    >
      {onBulkEdit && (
        <Menu.Item onClick={onBulkEdit}>
          <>
            <Icon type="Document" style={{ marginRight: 17 }} />
            <Detail strong>Bulk Edit Data {count}</Detail>
          </>
        </Menu.Item>
      )}
      {visionMLEnabled && onContextualise && (
        <Menu.Item onClick={onContextualise} disabled={!count || !inLimit}>
          <Tooltip
            content={
              <span data-testid="text-content">{exceededLimitMessage}</span>
            }
            disabled={!!inLimit}
          >
            <div style={{ display: 'flex' }}>
              <Icon type="Scan" style={{ marginRight: 17 }} />
              <Detail strong style={{ color: 'inherit' }}>
                Contextualise {count}
              </Detail>
            </div>
          </Tooltip>
        </Menu.Item>
      )}
      {onReview && (
        <Menu.Item onClick={onReview} disabled={!count}>
          <Icon type="Edit" style={{ marginRight: 17 }} />
          <Detail strong>Review {count}</Detail>
        </Menu.Item>
      )}
      {visionAutoMLEnabled && onTrainModel && (
        <Menu.Item onClick={onTrainModel} disabled={!count}>
          <Icon type="PlusCompact" style={{ marginRight: 17 }} />
          <Detail strong>Train Model {count}</Detail>
        </Menu.Item>
      )}
      {onDownload && (
        <Menu.Item
          onClick={onDownload}
          disabled={
            processingFiles !== undefined ? !count || processingFiles : !count
          }
        >
          <Icon type="Download" style={{ marginRight: 17 }} />
          <Detail strong style={{ color: 'inherit' }}>
            Download {count}
          </Detail>
        </Menu.Item>
      )}
      {onDelete && (
        <Popconfirm
          icon="WarningFilled"
          placement="bottom-end"
          onConfirm={onDelete}
          content="Are you sure you want to permanently delete this file?"
          disabled={
            processingFiles !== undefined ? !count || processingFiles : !count
          }
        >
          <Menu.Item
            disabled={
              processingFiles !== undefined ? !count || processingFiles : !count
            }
          >
            <Icon type="Trash" style={{ marginRight: 17 }} />
            <Detail strong style={{ color: 'inherit' }}>
              Delete {count}
            </Detail>
          </Menu.Item>
        </Popconfirm>
      )}
    </Menu>
  );

  return (
    <div style={style}>
      <Dropdown content={MenuContent}>
        <Button
          type="primary"
          icon="ChevronDownCompact"
          aria-label="dropdown button"
          disabled={!count}
          iconPlacement="right"
          style={{ marginLeft: 14 }}
        >
          Bulk actions {count}
        </Button>
      </Dropdown>
    </div>
  );
};
