import DocumentsCard from 'components/cards/DocumentsCard';
import Card from 'components/cards/Card';

import MetadataTable from '../MetadataTable';

import { AssetDetailsTabWrapper } from './elements';

export type AssetDetailsTabProps = {
  assetId: number;
};

const AssetDetailsTab = ({ assetId }: AssetDetailsTabProps) => {
  return (
    <AssetDetailsTabWrapper>
      <main>
        <Card header={{ title: '3D', icon: 'Cube' }}>3D</Card>
        <Card header={{ title: 'Time Series', icon: 'LineChart' }}>
          Time series
        </Card>
        <Card header={{ title: 'Events', icon: 'Events' }}>Events</Card>
        <DocumentsCard
          assetId={assetId}
          descriptionField="documentDescription"
        />
      </main>
      <aside>
        <Card
          className="slim-card"
          header={{
            title: 'Open in BestDay',
            icon: 'App.BestDay',
            appendIcon: 'ExternalLink',
          }}
        />
        <Card header={{ title: 'Metadata', icon: 'List' }} noPadding>
          <MetadataTable assetId={assetId} />
        </Card>
      </aside>
    </AssetDetailsTabWrapper>
  );
};

export default AssetDetailsTab;
