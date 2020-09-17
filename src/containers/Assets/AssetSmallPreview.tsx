import React, { useEffect, useMemo } from 'react';
import { TimeseriesFilterQuery } from 'cognite-sdk-v3';
import { AssetDetailsAbstract, Loader } from 'components/Common';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  list as listTimeseries,
  listSelector,
} from '@cognite/cdf-resources-store/dist/timeseries';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import {
  retrieve,
  itemSelector,
} from '@cognite/cdf-resources-store/dist/assets';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { FileSmallPreview } from 'containers/Files';
import { useSelectionButton } from 'hooks/useSelection';

const createTimeseriesFilter = (assetId: number): TimeseriesFilterQuery => ({
  filter: { assetSubtreeIds: [{ id: assetId }] },
});

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
  const dispatch = useResourcesDispatch();
  const selectionButton = useSelectionButton()({ type: 'asset', id: assetId });
  const { files: assetFiles } = useResourcesSelector(
    linkedFilesSelectorByAssetId
  )(assetId);

  const { items: assetTimeseries } = useResourcesSelector(listSelector)(
    createTimeseriesFilter(assetId),
    false
  );

  useEffect(() => {
    dispatch(retrieve([{ id: assetId }]));
    dispatch(listFilesLinkedToAsset(assetId));
    dispatch(listTimeseries(createTimeseriesFilter(assetId)));
  }, [assetId, dispatch]);

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

  const asset = useResourcesSelector(itemSelector)(assetId);
  if (!asset) {
    return <Loader />;
  }
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
};
