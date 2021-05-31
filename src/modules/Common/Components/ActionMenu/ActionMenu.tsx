import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Tooltip,
} from '@cognite/cogs.js';
import React from 'react';
import exifIcon from 'src/assets/exifIcon.svg';
import { ExifIcon } from '../../Containers/FileTableRenderers/NameRenderer';

interface ActionMenuProps {
  showExifIcon?: boolean;
  disabled?: boolean;
  handleReview: () => void;
  handleFileDelete: () => void;
  handleMetadataEdit: () => void;
}

export const ActionMenu = ({
  showExifIcon,
  disabled,
  handleReview,
  handleFileDelete,
  handleMetadataEdit,
}: ActionMenuProps) => {
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item onClick={handleMetadataEdit}>
        <Icon type="ResourceDocuments" style={{ marginRight: '17px' }} />
        File details
        {showExifIcon && (
          <Tooltip content="Exif data added">
            <ExifIcon>
              <img src={exifIcon} alt="exifIcon" />
            </ExifIcon>
          </Tooltip>
        )}
      </Menu.Item>
      <Menu.Item onClick={handleReview} disabled={disabled}>
        <Icon type="Edit" style={{ marginRight: '17px' }} />
        Review Annotations
      </Menu.Item>
      <Popconfirm
        icon="WarningFilled"
        placement="bottom-end"
        onConfirm={handleFileDelete}
        content="Are you sure you want to permanently delete this file?"
      >
        <Menu.Item disabled={disabled}>
          <Icon type="Trash" style={{ marginRight: '17px' }} />
          Delete
        </Menu.Item>
      </Popconfirm>
    </Menu>
  );

  const handleClick = (evt: any) => {
    // dummy handler to stop event propagation
    evt.stopPropagation();
  };
  return (
    <Dropdown content={MenuContent}>
      <Button
        type="ghost"
        icon="MoreOverflowEllipsisHorizontal"
        aria-label="dropdown button"
        onClick={handleClick}
      />
    </Dropdown>
  );
};
