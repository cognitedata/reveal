import React from 'react';
import { Link } from 'react-router-dom';
import { Space, Button, Dropdown, Menu, Tooltip } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useCollectionFeature } from 'app/utils/featureFlags';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceType } from 'lib';
import { createLink } from '@cognite/cdf-utilities';
import { usePermissions } from 'lib/hooks/CustomHooks';
import DownloadButton from './DownloadButton';
import CopyIdsButton from './CopyIdsButton';

type Props = {
  id: number;
  type: ResourceType;
};

function EditFileMenuButton({ id }: { id: number }) {
  const filesAcl = usePermissions('filesAcl', 'WRITE');
  const eventsAcl = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

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
}

function FileTitleRowActions({ id }: { id: number }) {
  const showCollections = useCollectionFeature();
  return (
    <Space>
      <EditFileMenuButton id={id} />
      <DownloadButton id={id} type="file" />

      {showCollections && (
        <CollectionsDropdown
          type="file"
          items={[{ id }]}
          button={<Button type="ghost" icon={<Icon type="Folder" />} />}
        />
      )}
      <CopyIdsButton id={id} type="file" />
      <MaximizeButton id={id} type="file" />
    </Space>
  );
}

function DefaultTitleRowActions({ type, id }: Props) {
  const showCollections = useCollectionFeature();

  return (
    <Space>
      <DownloadButton id={id} type={type} />
      {showCollections && (
        <CollectionsDropdown
          type={type}
          items={[{ id }]}
          button={<Button type="ghost" icon={<Icon type="Folder" />} />}
        />
      )}
      <CopyIdsButton id={id} type={type} />
      <MaximizeButton id={id} type={type} />
    </Space>
  );
}

function MaximizeButton({ type, id }: Props) {
  return (
    <Link to={createLink(`/explore/${type}/${id}`)}>
      <Button type="ghost" icon={<Icon type="Expand" />} />
    </Link>
  );
}

export default function TitleRowActions(props: Props) {
  switch (props.type) {
    case 'file':
      return <FileTitleRowActions id={props.id} />;
    default:
      return <DefaultTitleRowActions {...props} />;
  }
}
