import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  itemSelector,
  retrieve as retrieveFiles,
  retrieveExternal as retrieveExternalFiles,
} from 'modules/files';
import { Collapse, List, Row } from 'antd';
import { Button } from '@cognite/cogs.js';
import {
  retrieve as retrieveAssets,
  retrieveExternal as retrieveExternalAssets,
} from 'modules/assets';
import {
  listByFileId,
  linkedAssetsSelector,
  linkedFilesSelectorByFileId,
} from 'modules/annotations';
import { onResourceSelected } from 'modules/app';
import { CogniteFileViewer } from 'components/CogniteFileViewer';
import { useHistory } from 'react-router-dom';
import { Wrapper } from 'components/Common';

export const FilePreview = ({
  fileId,
  extraActions,
  showBack = true,
}: {
  fileId: number;
  extraActions?: React.ReactNode[];
  showBack?: boolean;
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const file = useSelector(itemSelector)(fileId);
  const { assetIds, assets } = useSelector(linkedAssetsSelector)(fileId);
  const { fileIds, files } = useSelector(linkedFilesSelectorByFileId)(fileId);

  useEffect(() => {
    (async () => {
      await dispatch(retrieveFiles([{ id: fileId }]));
      await dispatch(listByFileId(fileId));
    })();
  }, [dispatch, fileId]);

  useEffect(() => {
    dispatch(
      retrieveAssets(
        (assetIds.filter(id => typeof id === 'number') as number[]).map(id => ({
          id,
        }))
      )
    );
    dispatch(
      retrieveExternalAssets(
        (assetIds.filter(
          id => typeof id === 'string'
        ) as string[]).map(externalId => ({ externalId }))
      )
    );
  }, [dispatch, assetIds]);
  useEffect(() => {
    dispatch(
      retrieveFiles(
        (fileIds.filter(id => typeof id === 'number') as number[]).map(id => ({
          id,
        }))
      )
    );
    dispatch(
      retrieveExternalFiles(
        (fileIds.filter(
          id => typeof id === 'string'
        ) as string[]).map(externalId => ({ externalId }))
      )
    );
  }, [dispatch, fileIds]);

  return (
    <Wrapper>
      {showBack && (
        <Button className="back-button" onClick={() => history.goBack()}>
          Back
        </Button>
      )}
      <h1>{file ? file.name : 'Loading...'}</h1>
      <Row type="flex" gutter={12} justify="start" className="button-row">
        {extraActions}
      </Row>
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
            renderItem={asset => (
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
            renderItem={linkedFile => (
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
