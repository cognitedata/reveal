import React from 'react';

import styled from 'styled-components';

import { Icon, Menu, Popconfirm, Tooltip } from '@cognite/cogs.js';

import ExifIconSVG from '../../../../assets/exifIcon';
import { SKIP_MENU_CLOSE_ID } from '../../../../constants/ContextMenuConstants';
import { ExifIcon } from '../../Containers/FileTableRenderers/NameRenderer';

export interface ActionMenuProps {
  showExifIcon?: boolean;
  reviewDisabled?: boolean;
  handleReview?: (evt: any) => void;
  handleFileDelete: () => void;
  handleFileDetails: () => void;
}
const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

export const MenuContent = ({
  showExifIcon,
  reviewDisabled,
  handleReview,
  handleFileDelete,
  handleFileDetails,
}: ActionMenuProps) => (
  <Menu
    style={{
      color: 'black' /* typpy styles make color to be white here ... */,
    }}
    onClick={handleClick}
  >
    <Menu.Item onClick={handleFileDetails} icon="Document" iconPlacement="left">
      <MenuContainer>
        File details
        {showExifIcon && (
          <Tooltip content="Geolocated">
            <ExifIcon>
              <ExifIconSVG />
            </ExifIcon>
          </Tooltip>
        )}
      </MenuContainer>
    </Menu.Item>

    {handleReview && (
      <Menu.Item
        onClick={handleReview}
        disabled={reviewDisabled}
        icon="Edit"
        iconPlacement="left"
      >
        Review file
      </Menu.Item>
    )}
    <Popconfirm
      icon="WarningFilled"
      placement="left"
      onConfirm={handleFileDelete}
      content="Are you sure you want to permanently delete this file?"
    >
      <Menu.Item
        id={SKIP_MENU_CLOSE_ID}
        disabled={reviewDisabled}
        icon="Delete"
        iconPlacement="left"
      >
        Delete
      </Menu.Item>
    </Popconfirm>
  </Menu>
);

const MenuContainer = styled.div`
  display: flex;
  height: 21px;
`;
