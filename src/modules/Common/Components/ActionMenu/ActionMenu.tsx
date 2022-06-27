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
import { ExifIcon } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';

interface ActionMenuProps {
  buttonType?: string;
  showExifIcon?: boolean;
  reviewDisabled?: boolean;
  actionDisabled?: boolean;
  handleReview?: (evt: any) => void;
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
  reviewDisabled,
  actionDisabled,
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
        <Icon type="Document" style={{ marginRight: '17px' }} />
        File details
        {showExifIcon && (
          <Tooltip content="Geolocated">
            <ExifIcon>
              <img src={exifIcon} alt="exifIcon" />
            </ExifIcon>
          </Tooltip>
        )}
      </Menu.Item>
      {handleReview && (
        <Menu.Item onClick={handleReview} disabled={reviewDisabled}>
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
        <Menu.Item disabled={reviewDisabled}>
          <Icon type="Delete" style={{ marginRight: '17px' }} />
          Delete
        </Menu.Item>
      </Popconfirm>
    </Menu>
  );
  return (
    <Dropdown content={MenuContent} disabled={actionDisabled}>
      <Button
        type={(buttonType as ButtonType) || 'ghost'}
        variant={buttonType ? 'inverted' : 'default'}
        icon="EllipsisHorizontal"
        aria-label="dropdown button"
        onClick={handleClick}
        disabled={actionDisabled}
      />
    </Dropdown>
  );
};
