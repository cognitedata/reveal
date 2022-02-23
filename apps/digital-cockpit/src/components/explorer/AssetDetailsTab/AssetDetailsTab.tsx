import { allApplications } from 'constants/applications';

import DocumentsCard from 'components/cards/DocumentsCard';
import Card from 'components/cards/Card';
import ThreeDCard from 'components/cards/ThreeDCard';
import EventsCard from 'components/cards/EventsCard';
import { useAssetRetrieveQuery } from 'hooks/useQuery/useAssetQuery';
import StatusMessage from 'components/utils/StatusMessage';
import { useContext } from 'react';
import { CogniteSDKContext } from 'providers/CogniteSDKProvider';
import TimeSeriesCard from 'components/cards/TimeSeriesCard';

import MetadataTable from '../MetadataTable';

import { AssetDetailsTabWrapper } from './elements';

export type AssetDetailsTabProps = {
  assetId: number;
};

const AssetDetailsTab = ({ assetId }: AssetDetailsTabProps) => {
  const { client } = useContext(CogniteSDKContext);
  const { data: asset } = useAssetRetrieveQuery([{ id: assetId }]);
  const currentAsset = asset?.[0];
  const bestDayProps = allApplications.find((app) => app.key === 'bestday');
  if (!currentAsset) {
    return <StatusMessage type="Loading" />;
  }

  const isBestDayEnabled = () => {
    return currentAsset.labels?.some((label) =>
      label.externalId.includes('BEST_DAY')
    );
  };

  const renderAside = () => {
    const children = [];
    if (isBestDayEnabled()) {
      children.push(
        <Card
          className="slim-card"
          header={{
            title: 'Open in BestDay',
            icon: 'App.BestDay',
            appendIcon: 'ExternalLink',
            onClick: () => {
              window.open(
                `${bestDayProps?.url}/${client.project}/assets/${currentAsset.externalId}`,
                '_blank'
              );
            },
          }}
        />
      );
    }
    if (Object.keys(currentAsset?.metadata || {}).length > 0) {
      children.push(
        <div style={{ height: 500 }}>
          <Card header={{ title: 'Metadata', icon: 'List' }} noPadding>
            <div style={{ height: '100%' }}>
              <MetadataTable assetId={assetId} />
            </div>
          </Card>
        </div>
      );
    }
    if (children.length === 0) {
      return null;
    }
    return <aside>{children}</aside>;
  };
  return (
    <AssetDetailsTabWrapper>
      <main>
        <ThreeDCard assetId={assetId} />
        <TimeSeriesCard assetId={assetId} />
        <EventsCard assetId={assetId} />
        <DocumentsCard
          assetId={assetId}
          descriptionField="documentDescription"
        />
      </main>
      {renderAside()}
    </AssetDetailsTabWrapper>
  );
};

export default AssetDetailsTab;
