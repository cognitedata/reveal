import React, { useMemo } from 'react';
import { Timeseries, Asset, FileInfo } from '@cognite/sdk';
import { Loader } from 'lib/components';
import { useResourceActionsContext } from 'lib/context';
import { useSelectionButton } from 'lib/hooks/useSelection';
import { useCdfItem, useList } from '@cognite/sdk-react-query-hooks';
import { TimeseriesSmallPreview } from 'lib/containers/Timeseries';
import { AssetDetailsAbstract } from 'lib/containers/Assets';
import { FileSmallPreview } from 'lib/containers/Files';

export const AssetSmallPreview = ({
  assetId,
  actions: propActions,
  extras,
  children,
}: {
  assetId: number;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
}) => {
  const renderResourceActions = useResourceActionsContext();

  const { data: asset, isFetched } = useCdfItem<Asset>(
    'assets',
    { id: assetId },
    {
      enabled: !!assetId,
    }
  );

  const { data: assetFiles } = useList<FileInfo>(
    'files',
    { filter: { assetSubtreeIds: [{ id: assetId }] }, limit: 10 },
    { enabled: isFetched }
  );
  const { data: assetTimeseries } = useList<Timeseries>(
    'timeseries',
    { filter: { assetSubtreeIds: [{ id: assetId }] }, limit: 100 },
    { enabled: isFetched }
  );

  const selectionButton = useSelectionButton()({ type: 'asset', id: assetId });

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: assetId,
        type: 'asset',
      })
    );
    return items;
  }, [renderResourceActions, selectionButton, assetId, propActions]);

  if (!isFetched) {
    return <Loader />;
  }

  if (asset) {
    return (
      <>
        <AssetDetailsAbstract
          key={assetId}
          asset={asset}
          timeseries={assetTimeseries || []}
          files={assetFiles || []}
          extras={extras}
          actions={actions}
          timeseriesPreview={timeseries => (
            <TimeseriesSmallPreview timeseriesId={timeseries.id} />
          )}
          filePreview={file => <FileSmallPreview fileId={file.id} />}
        >
          {children}
        </AssetDetailsAbstract>
      </>
    );
  }

  return null;
};
