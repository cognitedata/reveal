import { Button, Dropdown, Icon, Menu, Popconfirm } from '@cognite/cogs.js';
import React from 'react';

interface ReviewButtonProps {
  showPolygon?: boolean;
  disableShowPolygon?: boolean;
  // handleEditLabel: () => void;
  // handleEditPolygon: () => void;
  handleVisibility: () => void;
  handleAnnotationDelete: () => void;
}

export const AnnotationActionMenuExtended = ({
  showPolygon,
  disableShowPolygon,
  // handleEditLabel,
  // handleEditPolygon,
  handleVisibility,
  handleAnnotationDelete,
}: ReviewButtonProps) => {
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      {/* <Menu.Item onClick={handleEditLabel}>
        <Icon type="Edit" style={{ marginRight: '17px' }} />
        Edit label
      </Menu.Item>
      <Menu.Item onClick={handleEditPolygon}>
        <Icon type="Polygon" style={{ marginRight: '17px' }} />
        Edit polygon
      </Menu.Item> */}
      <Menu.Item onClick={handleVisibility} disabled={disableShowPolygon}>
        <Icon
          type={showPolygon ? 'EyeShow' : 'EyeHide'}
          style={{ marginRight: '17px' }}
        />
        Show/hide
      </Menu.Item>
      <Popconfirm
        icon="WarningFilled"
        placement="bottom-end"
        onConfirm={handleAnnotationDelete}
        content="Are you sure you want to permanently delete this annotation?"
      >
        <Menu.Item>
          <Icon type="Trash" style={{ marginRight: '17px' }} />
          Delete annotation
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
