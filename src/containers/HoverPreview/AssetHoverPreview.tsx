import React, { useEffect } from 'react';
import { Asset, TimeseriesFilterQuery } from '@cognite/sdk';
import { AssetDetailsAbstract, Popover } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@cognite/cogs.js';
import { list as listTimeseries, listSelector } from 'modules/timeseries';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import { TimeseriesHoverPreview } from './TimeseriesHoverPreview';
import { FileHoverPreview } from './FileHoverPreview';

const createTimeseriesFilter = (assetId: number): TimeseriesFilterQuery => ({
  filter: { assetSubtreeIds: [{ id: assetId }] },
});

export const AssetHoverPreview = ({
  asset,
  actions,
  extras,
  disableSidebarToggle = false,
  renderResourceActions = () => [],
}: {
  asset: Asset;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  disableSidebarToggle?: boolean;
  renderResourceActions?: (props: {
    fileId?: number;
    timeseriesId?: number;
  }) => React.ReactNode[];
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { files: assetFiles } = useSelector(linkedFilesSelectorByAssetId)(
    asset ? asset.id : undefined
  );

  const { items: assetTimeseries } = useSelector(listSelector)(
    createTimeseriesFilter(asset ? asset.id : -1),
    false
  );

  useEffect(() => {
    dispatch(listFilesLinkedToAsset(asset.id));
    dispatch(listTimeseries(createTimeseriesFilter(asset.id)));
  }, [asset.id, dispatch]);

  return (
    <AssetDetailsAbstract
      key={asset.id}
      asset={asset}
      timeseries={assetTimeseries || []}
      files={assetFiles || []}
      extras={extras}
      actions={
        disableSidebarToggle
          ? actions
          : [
              <Button
                icon="Expand"
                key="open"
                onClick={() =>
                  dispatch(
                    onResourceSelected(
                      {
                        assetId: asset.id,
                        showSidebar: true,
                      },
                      history
                    )
                  )
                }
              >
                View
              </Button>,
              ...(actions || []),
            ]
      }
      timeseriesPreview={(timeseries, content) => {
        const tsActions = renderResourceActions({
          timeseriesId: timeseries.id,
        });
        return (
          <Popover
            key={timeseries.id}
            content={
              <TimeseriesHoverPreview
                timeseries={timeseries}
                actions={tsActions}
              />
            }
          >
            <div style={{ position: 'relative' }}>{content}</div>
          </Popover>
        );
      }}
      filePreview={(file, content) => {
        const fileActions = renderResourceActions({
          fileId: file.id,
        });
        return (
          <Popover
            key={file.id}
            content={<FileHoverPreview file={file} actions={fileActions} />}
          >
            <div style={{ position: 'relative' }}>{content}</div>
          </Popover>
        );
      }}
    />
  );
};
