import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { List, Tabs } from 'antd';
import { Button, Icon, Title } from '@cognite/cogs.js';
import {
  AssetBreadcrumb,
  AssetDetailsPanel,
  AssetTree,
} from '@cognite/gearbox';
import {
  linkedFilesSelectorByAssetId,
  listFilesLinkedToAsset,
} from 'modules/annotations';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAsset,
} from 'modules/assets';
import {
  list as listFiles,
  retrieve as retrieveFiles,
  listSelector as listFileSelector,
} from 'modules/files';
import { FilesSearchFilter } from '@cognite/sdk';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';
import { DetailsItem } from 'components/Common';
import moment from 'moment';
import unionBy from 'lodash/unionBy';
import { Wrapper } from './Common';

const createFilesFilter = (assetId: number): FilesSearchFilter => ({
  filter: { assetSubtreeIds: [{ id: assetId }] },
  limit: 1000,
});
export const AssetMetadataPreview = ({
  assetId,
  extraActions,
}: {
  assetId: number;
  extraActions?: React.ReactNode[];
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const asset = useSelector(assetSelector)(assetId);
  const {
    files: filesByAnnotations,
    fileIds: filesByAnnotationsIds,
  } = useSelector(linkedFilesSelectorByAssetId)(assetId);
  const { items: filesByAssetId } = useSelector(listFileSelector)(
    createFilesFilter(assetId),
    true
  );

  const files = unionBy(filesByAnnotations, filesByAssetId, (el) => el.id);

  useEffect(() => {
    (async () => {
      await dispatch(retrieveAsset([{ id: assetId }]));
      await dispatch(listFilesLinkedToAsset(assetId));
      await dispatch(listFiles(createFilesFilter(assetId), true));
    })();
  }, [dispatch, assetId]);

  useEffect(() => {
    if (filesByAnnotationsIds) {
      dispatch(retrieveFiles(filesByAnnotationsIds.map((id) => ({ id }))));
    }
  }, [dispatch, filesByAnnotationsIds]);

  return (
    <Wrapper>
      <Button className="back-button" onClick={() => history.goBack()}>
        Back
      </Button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <span style={{ marginRight: '12px' }}>LOCATION:</span>
        <AssetBreadcrumb
          assetId={assetId}
          onBreadcrumbClick={(newAsset) =>
            dispatch(onResourceSelected({ assetId: newAsset.id }, history))
          }
        />
      </div>
      <h1>
        <Icon type="DataStudio" /> {asset ? asset.name : 'Loading...'}
      </h1>
      {extraActions}
      <Tabs>
        <Tabs.TabPane key="asset-metadata" tab="Asset Details">
          <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
            Details
          </Title>
          <DetailsItem name="Description" value={asset?.description} />
          <DetailsItem name="Source" value={asset?.source} />
          <DetailsItem name="External ID" value={asset?.externalId} />
          <DetailsItem
            name="Created at"
            value={
              asset
                ? moment(asset.createdTime).format('MM/DD/YYYY HH:MM')
                : 'Loading...'
            }
          />
          <DetailsItem
            name="Updated at"
            value={
              asset
                ? moment(asset.lastUpdatedTime).format('MM/DD/YYYY HH:MM')
                : 'Loading...'
            }
          />
          <Title level={4} style={{ marginTop: 12, marginBottom: 12 }}>
            Metadata
          </Title>
          <AssetDetailsPanel assetId={assetId} />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="files"
          tab={<span>Linked Files ({files.length})</span>}
        >
          <List
            renderItem={(file) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (file) {
                    dispatch(
                      onResourceSelected(
                        { fileId: file.id, showSidebar: true },
                        history
                      )
                    );
                  }
                }}
              >
                <List.Item.Meta
                  title={file.name}
                  description={file.externalId}
                />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={files}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="children" tab="Children">
          <AssetTree
            assetIds={[assetId]}
            defaultExpandedKeys={[assetId]}
            onSelect={(newAsset) => {
              if (newAsset.node) {
                dispatch(
                  onResourceSelected(
                    {
                      assetId: newAsset.node.id,
                      showSidebar: true,
                    },
                    history
                  )
                );
              }
            }}
          />
        </Tabs.TabPane>
      </Tabs>
    </Wrapper>
  );
};
