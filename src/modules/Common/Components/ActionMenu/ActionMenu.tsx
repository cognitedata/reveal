import {
  Button,
  ButtonType,
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
  buttonType?: string;
  showExifIcon?: boolean;
  disabled?: boolean;
  handleReview?: () => void;
  handleFileDelete: () => void;
  handleFileDetails: () => void;
}
const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

export const ActionMenu = ({
  buttonType,
  showExifIcon,
  disabled,
  handleReview,
  handleFileDelete,
  handleFileDetails,
}: ActionMenuProps) => {
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
      onClick={handleClick}
    >
      <Menu.Item onClick={handleFileDetails}>
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
      {handleReview && (
        <Menu.Item onClick={handleReview} disabled={disabled}>
          <Icon type="Edit" style={{ marginRight: '17px' }} />
          Review file
        </Menu.Item>
      )}
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
  return (
    <Dropdown content={MenuContent}>
      <Button
        type={(buttonType as ButtonType) || 'ghost'}
        variant={buttonType ? 'inverted' : 'default'}
        icon="MoreOverflowEllipsisHorizontal"
        aria-label="dropdown button"
        onClick={handleClick}
      />
    </Dropdown>
  );
};
