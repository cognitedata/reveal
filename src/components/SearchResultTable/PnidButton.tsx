import React from 'react';
import { Button, Tooltip } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { useParams } from 'react-router-dom';
import { useFilesAssetAppearsIn } from 'components/FileList';
import { useLinkedAsset } from 'hooks/api';
import { trackUsage } from 'utils/metrics';
import { useNavigate } from 'hooks';

export const PnidButton = ({
  asset,
  timeseriesId,
  showTooltip = true,
  hideWhenEmpty = true,
}: {
  asset?: Asset;
  timeseriesId?: number;
  showTooltip?: boolean;
  hideWhenEmpty?: boolean;
}) => {
  const move = useNavigate();
  const { chartId } = useParams<{ chartId: string }>();

  const shouldFetchLinkedAsset = !asset;

  const { data: linkedAsset, isFetched: isAssetFetched } = useLinkedAsset(
    timeseriesId,
    shouldFetchLinkedAsset
  );

  const { data: files = [], isFetched } = useFilesAssetAppearsIn(
    asset || linkedAsset,
    shouldFetchLinkedAsset ? isAssetFetched : true
  );

  if (!isFetched) {
    return <></>;
  }

  if (files.length === 0) {
    return hideWhenEmpty ? <></> : <span>-</span>;
  }

  return (
    <WithTooltip content={showTooltip ? 'P&IDs' : undefined}>
      <Button
        type="tertiary"
        icon="SearchDocuments"
        onClick={() => {
          move(`/${chartId}/files/${asset ? asset?.id : linkedAsset?.id}`);

          // `asset` prop is passed in only when button is placed in search view for now
          // There is probably a better way to determine whether the source is search or time series row?
          trackUsage('ChartView.ViewFiles', {
            source: asset ? 'search' : 'chart',
          });
        }}
        style={{ height: 28 }}
        aria-label="search"
      />
    </WithTooltip>
  );
};

const WithTooltip = ({
  content,
  children,
}: {
  content?: string;
  children: React.ReactElement;
}) => {
  return content ? <Tooltip content={content}>{children}</Tooltip> : children;
};
