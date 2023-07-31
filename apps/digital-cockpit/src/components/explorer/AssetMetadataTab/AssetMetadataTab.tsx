import { useAssetRetrieveQuery } from 'hooks/useQuery/useAssetQuery';
import StatusMessage from 'components/utils/StatusMessage';
import { Input } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { useState } from 'react';

import MetadataTable from '../MetadataTable';

import { AssetMetadataTabWrapper, TopGrid } from './elements';

export type AssetMetadataTabProps = {
  assetId: number;
};

const AssetMetadataTab = ({ assetId }: AssetMetadataTabProps) => {
  const { data: asset } = useAssetRetrieveQuery([{ id: assetId }]);
  const [searchQuery, setSearchQuery] = useState('');
  const currentAsset = asset?.[0];
  if (!currentAsset) {
    return <StatusMessage type="Loading" />;
  }
  const renderGridItem = (key: string, value?: string | number) => {
    return (
      <div>
        <h4>{key}</h4>
        <span>{value || 'Not set'}</span>
      </div>
    );
  };
  return (
    <AssetMetadataTabWrapper>
      <main>
        <TopGrid>
          {renderGridItem('Name', currentAsset.name)}
          {renderGridItem('Description', currentAsset.description)}
          {renderGridItem('ID', currentAsset.id)}
          {renderGridItem('External ID', currentAsset.externalId)}
          {renderGridItem('Dataset ID', currentAsset.dataSetId)}
          {renderGridItem(
            'Created at',
            dayjs(currentAsset.createdTime).format('LLLL')
          )}
          {renderGridItem(
            'Updated at',
            dayjs(currentAsset.lastUpdatedTime).format('LLLL')
          )}
          {renderGridItem('Source', currentAsset.source)}
        </TopGrid>
      </main>
      <h3 style={{ marginTop: 32 }}>Metadata</h3>
      <div>
        <Input
          value={searchQuery}
          placeholder="Filter metadata"
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <MetadataTable assetId={currentAsset.id} asTable filter={searchQuery} />
      </div>
    </AssetMetadataTabWrapper>
  );
};

export default AssetMetadataTab;
