import { Button, Dropdown, Icon, Menu, Popconfirm } from '@cognite/cogs.js';
import React from 'react';

interface ReviewButtonProps {
  disabled?: boolean;
  handleReview: () => void;
  handleAnnotationDelete: () => void;
}

export const AnnotationActionMenu = ({
  disabled,
  handleReview,
  handleAnnotationDelete,
}: ReviewButtonProps) => {
  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item onClick={handleReview} disabled={disabled}>
        <Icon type="Edit" style={{ marginRight: '17px' }} />
        Review Annotation
      </Menu.Item>
      <Popconfirm
        icon="WarningFilled"
        placement="bottom-end"
        onConfirm={handleAnnotationDelete}
        content="Are you sure you want to permanently delete this annotation?"
      >
        <Menu.Item disabled={disabled}>
          <Icon type="Delete" style={{ marginRight: '17px' }} />
          Delete annotation
        </Menu.Item>
      </Popconfirm>
    </Menu>
  );
  return (
    <Dropdown content={MenuContent}>
      <Button
        type="ghost"
        icon="EllipsisHorizontal"
        aria-label="dropdown button"
      />
    </Dropdown>
  );
};
