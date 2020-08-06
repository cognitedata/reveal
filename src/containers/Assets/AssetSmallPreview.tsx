import React, { useEffect, useMemo } from 'react';
import { TimeseriesFilterQuery } from '@cognite/sdk';
import { AssetDetailsAbstract, Loader } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import { list as listTimeseries, listSelector } from 'modules/timeseries';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import { retrieve, itemSelector } from 'modules/assets';
import { useResourceActionsContext } from 'context/ResourceActionsContext';

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
  const dispatch = useDispatch();
  const { files: assetFiles } = useSelector(linkedFilesSelectorByAssetId)(
    assetId
  );

  const { items: assetTimeseries } = useSelector(listSelector)(
    createTimeseriesFilter(assetId),
    false
  );

  useEffect(() => {
    dispatch(retrieve([{ id: assetId }]));
    dispatch(listFilesLinkedToAsset(assetId));
    dispatch(listTimeseries(createTimeseriesFilter(assetId)));
  }, [assetId, dispatch]);

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        assetId,
      })
    );
    return items;
  }, [renderResourceActions, assetId, propActions]);

  const asset = useSelector(itemSelector)(assetId);
  if (!asset) {
    return <Loader />;
  }
  return (
    <AssetDetailsAbstract
      key={assetId}
      asset={asset}
      timeseries={assetTimeseries || []}
      files={assetFiles || []}
      extras={extras}
      actions={actions}
    >
      {children}
    </AssetDetailsAbstract>
  );
};
