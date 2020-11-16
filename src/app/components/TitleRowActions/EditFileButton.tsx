import React from 'react';
import { Button, Dropdown, Menu, Tooltip } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { ResourceItem } from 'lib/types';

export const EditFileButton = ({
  item: { id, type },
}: {
  item: ResourceItem;
}) => {
  const filesAcl = usePermissions('filesAcl', 'WRITE');
  const eventsAcl = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  if (type !== 'file') {
    return null;
  }

  const menu = (
    <Menu>
      <Menu.Item disabled>
        <Icon type="Plus" /> Add new tags
      </Menu.Item>
      <Menu.Item disabled>
        <Icon type="ThreeD" /> Detect objects
      </Menu.Item>
      <Menu.Item disabled>
        <Icon type="Close" /> Clear tags
      </Menu.Item>
    </Menu>
  );

  if (!writeAccess) {
    const errors = [];
    if (!filesAcl) {
      errors.push('files:write is missing');
    }
    if (!eventsAcl) {
      errors.push('event:write is missing');
    }
    return (
      <Tooltip
        placement="bottom"
        title={
          <>
            <p>
              You do not have the necessary permissions to edit this file. You
              need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button type="ghost" icon={<Icon type="Edit" />} disabled />
      </Tooltip>
    );
  }

  return (
    <Dropdown overlay={menu} key={id}>
      <Button type="ghost" icon={<Icon type="Edit" />} />
    </Dropdown>
  );
};
