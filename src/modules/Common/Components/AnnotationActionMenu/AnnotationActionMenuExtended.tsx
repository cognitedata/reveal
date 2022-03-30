import { Button, Dropdown, Icon, Menu, Popconfirm } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

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
        <Menu.Item onClick={handleVisibility} disabled={disableShowPolygon}>
          <Icon
            type={showPolygon ? 'EyeShow' : 'EyeHide'}
            style={{ marginRight: '17px' }}
          />
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
          'Are you sure you want to permanently delete this annotation?'
        }
      >
        <Menu.Item>
          <Icon type="Trash" style={{ marginRight: '17px' }} />
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
      <StyledButton
        type="ghost"
        icon="MoreOverflowEllipsisHorizontal"
        aria-label="dropdown button"
        onClick={handleClick}
      />
    </Dropdown>
  );
};

const StyledButton = styled(Button)`
  height: 30px;
  width: 30px;
  box-sizing: border-box;
  padding: 7px;
`;
