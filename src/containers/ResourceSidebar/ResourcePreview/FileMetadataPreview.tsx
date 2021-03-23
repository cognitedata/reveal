import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  itemSelector,
  retrieveItemsById as retrieveFiles,
  retrieveItemsByExternalId as retrieveExternalFiles,
} from 'modules/files';
import { Collapse, List } from 'antd';
import { Button, Title } from '@cognite/cogs.js';
import {
  retrieveItemsById as retrieveAssets,
  retrieveItemsByExternalId as retrieveExternalAssets,
} from 'modules/assets';
import {
  listAnnotationsByFileId,
  linkedAssetsSelector,
  linkedFilesSelectorByFileId,
} from 'modules/annotations';
import { onResourceSelected } from 'modules/app';
import { CogniteFileViewer } from 'components/CogniteFileViewer';
import { useHistory } from 'react-router-dom';
import { Wrapper } from './Common';

export const FileMetadataPreview = ({
  fileId,
  extraActions,
}: {
  fileId: number;
  extraActions?: React.ReactNode[];
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  // @ts-ignore
  const file = useSelector(itemSelector)(fileId);
  const { assetIds, assets } = useSelector(linkedAssetsSelector)(fileId);
  const { fileIds, files } = useSelector(linkedFilesSelectorByFileId)(fileId);

  useEffect(() => {
    (async () => {
      await dispatch(retrieveFiles({ ids: [{ id: fileId }] }));
      await dispatch(listAnnotationsByFileId({ fileId }));
    })();
  }, [dispatch, fileId]);

  useEffect(() => {
    const assetToRetrieveById = (assetIds.filter(
      (id: number | string) => typeof id === 'number'
    ) as number[]).map((id) => ({
      id,
    }));
    const assetsToRetrieveByExternalId = (assetIds.filter(
      (id: number | string) => typeof id === 'string'
    ) as string[]).map((externalId) => ({ externalId }));
    dispatch(retrieveAssets({ ids: assetToRetrieveById }));
    dispatch(retrieveExternalAssets({ ids: assetsToRetrieveByExternalId }));
  }, [dispatch, assetIds]);

  useEffect(() => {
    const filesToRetrieveById = (fileIds.filter(
      (id: number | string) => typeof id === 'number'
    ) as number[]).map((id) => ({
      id,
    }));
    const filesToRetrieveByExternalId = (fileIds.filter(
      (id: number | string) => typeof id === 'string'
    ) as string[]).map((externalId) => ({ externalId }));
    dispatch(retrieveFiles({ ids: filesToRetrieveById }));
    dispatch(retrieveExternalFiles({ ids: filesToRetrieveByExternalId }));
  }, [dispatch, fileIds]);

  return (
    <Wrapper>
      <Button className="back-button" onClick={() => history.goBack()}>
        Back
      </Button>
      <Title level={2}>{file ? file.name : 'Loading...'}</Title>
      {extraActions}
      {file && file.mimeType === 'application/pdf' && (
        <div style={{ height: 800, marginTop: 24, marginBottom: 24 }}>
          <CogniteFileViewer fileId={fileId} />
        </div>
      )}
      <Collapse>
        <Collapse.Panel
          key="assets"
          header={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Assets Tags Detected ({assets.length})
            </span>
          }
        >
          <List
            renderItem={(asset: any) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (asset) {
                    dispatch(
                      onResourceSelected({ assetId: asset.id }, history)
                    );
                  }
                }}
              >
                <List.Item.Meta
                  title={asset.name}
                  description={asset.description}
                />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={assets}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="files"
          header={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              Files Tags Detected ({files.length})
            </span>
          }
        >
          <List
            renderItem={(linkedFile: any) => (
              <List.Item
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (linkedFile) {
                    dispatch(
                      onResourceSelected({ fileId: linkedFile.id }, history)
                    );
                  }
                }}
              >
                <List.Item.Meta
                  title={linkedFile.name}
                  description={linkedFile.externalId}
                />
              </List.Item>
            )}
            pagination={{ position: 'bottom' }}
            dataSource={files}
          />
        </Collapse.Panel>
        <Collapse.Panel key="metdata" header="Metadata">
          <pre>{JSON.stringify(file, null, 2)}</pre>
        </Collapse.Panel>
      </Collapse>
    </Wrapper>
  );
};
