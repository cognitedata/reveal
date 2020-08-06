import React, { useEffect } from 'react';
import { TimeseriesFilterQuery } from '@cognite/sdk';
import { AssetDetailsAbstract, Popover, Loader } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import { list as listTimeseries, listSelector } from 'modules/timeseries';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { FileSmallPreview } from 'containers/Files';
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

  const asset = useSelector(itemSelector)(assetId);
  if (!asset) {
    return <Loader />;
  }

  const actions: React.ReactNode[] = [];
  actions.push(...(propActions || []));
  actions.push(
    ...renderResourceActions({
      assetId,
    })
  );

  return (
    <AssetDetailsAbstract
      key={assetId}
      asset={asset}
      timeseries={assetTimeseries || []}
      files={assetFiles || []}
      extras={extras}
      actions={actions}
      timeseriesPreview={(timeseries, content) => {
        return (
          <Popover
            key={timeseries.id}
            content={<TimeseriesSmallPreview timeseriesId={timeseries.id} />}
          >
            <div style={{ position: 'relative' }}>{content}</div>
          </Popover>
        );
      }}
      filePreview={(file, content) => {
        return (
          <Popover
            key={file.id}
            content={<FileSmallPreview fileId={file.id} />}
          >
            <div style={{ position: 'relative' }}>{content}</div>
          </Popover>
        );
      }}
    >
      {children}
    </AssetDetailsAbstract>
  );
};
