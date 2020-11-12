import React from 'react';
import { Link } from 'react-router-dom';
import { Space, Button } from 'antd';
import { Icon } from '@cognite/cogs.js';
import { useCollectionFeature } from 'app/utils/featureFlags';
import CollectionsDropdown from 'app/components/CollectionsDropdown';
import { ResourceType } from 'lib';
import { createLink } from '@cognite/cdf-utilities';
import DownloadButton from './DownloadButton';

type Props = {
  id: number;
  type: ResourceType;
};

export default function TitleRowActions({ type, id }: Props) {
  const showCollections = useCollectionFeature();

  return (
    <Space>
      <DownloadButton id={id} type={type} />
      <Button type="ghost" disabled>
        <Icon type="DataTable" />
      </Button>
      {showCollections && (
        <CollectionsDropdown
          type={type}
          items={[{ id }]}
          button={
            <Button type="ghost">
              <Icon type="Folder" />
            </Button>
          }
        />
      )}
      <Button type="ghost" disabled>
        <Icon type="Copy" />
      </Button>
      <Link to={createLink(`/explore/${type}/${id}`)}>
        <Button type="ghost">View</Button>
      </Link>
    </Space>
  );
}
