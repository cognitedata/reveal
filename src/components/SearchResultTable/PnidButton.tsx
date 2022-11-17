import { ReactNode } from 'react';
import { Button } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useParams, useNavigate } from 'react-router-dom';
import { useLinkedAsset } from 'hooks/cdf-assets';
import { createInternalLink } from 'utils/link';
import { trackUsage } from 'services/metrics';
import { StatusIcon } from 'components/StatusIcon/StatusIcon';
import { useFilesAssetAppearsIn } from 'components/FileList/hooks';

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

  if (!isFetched && !isAssetFetched) {
    return <StatusIcon status="Running" />;
  }

  if (files.length === 0) {
    return hideWhenEmpty ? <></> : <span>-</span>;
  }

  const handleButtonClick = () => {
    move(
      createInternalLink(
        `/${chartId}/files/${asset ? asset?.id : linkedAsset?.id}`
      )
    );

    // `asset` prop is passed in only when button is placed in search view for now
    // There is probably a better way to determine whether the source is search or time series row?
    trackUsage('ChartView.ViewFiles', {
      source: asset ? 'search' : 'chart',
    });
  };

  return (
    <Button
      type={asset ? 'tertiary' : 'ghost'}
      icon="Document"
      onClick={handleButtonClick}
      style={{ height: 28 }}
      iconPlacement="right"
      size="small"
      aria-label="search"
    >
      {children}
    </Button>
  );
};
