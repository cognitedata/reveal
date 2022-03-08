import { ReactNode } from 'react';
import { Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useParams } from 'react-router-dom';
import { useFilesAssetAppearsIn } from 'components/FileList';
import { useLinkedAsset } from 'hooks/cdf-assets';
import { trackUsage } from 'services/metrics';
import { useNavigate } from 'hooks/navigation';
import { StatusIcon } from 'components/StatusIcon/StatusIcon';

export const PnidButton = ({
  asset,
  timeseriesExternalId,
  hideWhenEmpty = true,
  children,
}: {
  asset?: Asset;
  timeseriesExternalId?: string;
  hideWhenEmpty?: boolean;
  children?: ReactNode;
}) => {
  const move = useNavigate();
  const { chartId } = useParams<{ chartId: string }>();

  const shouldFetchLinkedAsset = !asset;

  const { data: linkedAsset, isFetched: isAssetFetched } = useLinkedAsset(
    timeseriesExternalId,
    shouldFetchLinkedAsset
  );

  const { data: files = [], isFetched } = useFilesAssetAppearsIn(
    asset || linkedAsset,
    shouldFetchLinkedAsset ? isAssetFetched : true
  );

  if (!isFetched) {
    return <StatusIcon status="Running" />;
  }

  if (files.length === 0) {
    return hideWhenEmpty ? <></> : <span>-</span>;
  }

  return (
    <Button
      type={asset ? 'tertiary' : 'ghost'}
      icon="Document"
      onClick={() => {
        move(`/${chartId}/files/${asset ? asset?.id : linkedAsset?.id}`);

        // `asset` prop is passed in only when button is placed in search view for now
        // There is probably a better way to determine whether the source is search or time series row?
        trackUsage('ChartView.ViewFiles', {
          source: asset ? 'search' : 'chart',
        });
      }}
      style={{ height: 28 }}
      iconPlacement="right"
      size="small"
      aria-label="search"
    >
      {children}
    </Button>
  );
};
