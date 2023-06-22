import React from 'react';

import { Button, Dropdown, Icon, Menu, Popconfirm } from '@cognite/cogs.js';

interface AnnotationActionMenuExtendedProps {
  showPolygon?: boolean;
  disableShowPolygon?: boolean;
  handleVisibility?: () => void;
  handleAnnotationDelete: () => void;
  deleteMenuText?: string;
  deleteConfirmText?: string;
}

export const AnnotationActionMenuExtended = ({
  showPolygon,
  disableShowPolygon,
  handleVisibility,
  handleAnnotationDelete,
  deleteMenuText,
  deleteConfirmText,
}: AnnotationActionMenuExtendedProps) => {
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      {handleVisibility ? (
        <Menu.Item
          onClick={handleVisibility}
          disabled={disableShowPolygon}
          icon={showPolygon ? 'EyeShow' : 'EyeHide'}
          iconPlacement="left"
        >
          Show/hide
        </Menu.Item>
      ) : (
        <></>
      )}

      <Popconfirm
        icon="WarningFilled"
        placement="bottom-end"
        onConfirm={handleAnnotationDelete}
        content={
          deleteConfirmText ||
          'Are you sure you want to permanently\ndelete this annotation?'
        }
      >
        <Menu.Item icon="Delete" iconPlacement="left">
          {deleteMenuText || 'Delete annotation'}
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
        size="small"
        icon="EllipsisHorizontal"
        aria-label="Get available actions on annotation"
        onClick={handleClick}
      />
    </Dropdown>
  );
};
