import React, { useMemo } from 'react';
import { Timeseries, Asset, FileInfo } from '@cognite/sdk';
import { AssetDetailsAbstract, Loader } from 'components/Common';

import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { FileSmallPreview } from 'containers/Files';
import { useSelectionButton } from 'hooks/useSelection';
import { useCdfItem, useList } from 'hooks/sdk';

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

  const { data: asset, isFetched } = useCdfItem<Asset>('assets', assetId, {
    enabled: !!assetId,
  });

  const { data: assetFiles } = useList<FileInfo>(
    'files',
    10,
    { assetSubtreeIds: [{ id: assetId }] },
    { enabled: isFetched }
  );
  const { data: assetTimeseries } = useList<Timeseries>(
    'timeseries',
    100,
    { assetSubtreeIds: [{ id: assetId }] },
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
