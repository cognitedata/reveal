import React from 'react';
import { Button, ButtonProps } from '@cognite/cogs.js';
import { Popconfirm, Tooltip } from 'antd';
import { getActionLabel, getContainer } from 'utils/utils';
import { AccessPermission } from 'utils/types';

interface AccessButtonProps extends ButtonProps {
  permissions?: AccessPermission[];
  hasWriteAccess?: boolean;
  children?: any;
  confirmationMessage?: string;
  disabledMessage?: string;
  tooltipMessage?: string;
}

const AccessButton = ({
  permissions,
  children,
  confirmationMessage,
  disabledMessage,
  tooltipMessage,
  onClick,
  hasWriteAccess,
}: AccessButtonProps) => {
  const accessRequired = (
    <p>
      To gain access, please request permission from your administrator for the
      following:
      {permissions?.map((permission) => (
        <span style={{ fontWeight: 'bold' }} key={permission.acl}>
          <br />
          {permission.actions.map(
            (action) => `${getActionLabel(permission.acl, action)} `
          )}
          <br />
          {permission.scope && 'scoped to the specific id or scope all'}
        </span>
      ))}
    </p>
  );

  const showConfirm =
    hasWriteAccess && !!confirmationMessage && !disabledMessage;

  return (
    <Popconfirm
      title={confirmationMessage}
      onConfirm={(e) =>
        onClick && onClick(e as React.MouseEvent<HTMLButtonElement, MouseEvent>)
      }
      disabled={!showConfirm}
      style={{
        zIndex: 999, // eslint-disable-line
        width: '100%',
      }}
      okText="Yes"
      cancelText="No"
      cancelButtonProps={{ type: 'default' }}
    >
      <Tooltip
        style={{ width: '100%' }}
        title={
          (!hasWriteAccess && accessRequired) ||
          disabledMessage ||
          tooltipMessage
        }
        getPopupContainer={getContainer}
      >
        <Button
          type="secondary"
          icon="Upload"
          iconPlacement="right"
          disabled={!hasWriteAccess || !!disabledMessage}
          onClick={(e) => {
            if (!showConfirm && onClick) {
              onClick(e);
            }
          }}
        >
          {children && children}
        </Button>
      </Tooltip>
    </Popconfirm>
  );
};

export default AccessButton;
