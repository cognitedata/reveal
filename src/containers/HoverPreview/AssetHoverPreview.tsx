import React, { useEffect } from 'react';
import { Asset } from '@cognite/sdk';
import { AssetDetailsAbstract, Popover } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@cognite/cogs.js';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import { FileHoverPreview } from './FileHoverPreview';

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

  useEffect(() => {
    dispatch(listFilesLinkedToAsset.action({ assetId: asset.id }));
  }, [asset.id, dispatch]);

  return (
    <AssetDetailsAbstract
      key={asset.id}
      asset={asset}
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
