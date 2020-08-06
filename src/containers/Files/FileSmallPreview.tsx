import React, { useEffect, useMemo } from 'react';
import { InternalId, ExternalId } from '@cognite/sdk';
import { FileDetailsAbstract, Loader } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import {
  retrieve as retrieveFiles,
  retrieveExternal as retrieveFilesExternal,
  itemSelector,
} from 'modules/files';
import {
  retrieve as retrieveAssets,
  retrieveExternal as retrieveAssetsExternal,
} from 'modules/assets';
import {
  listByFileId,
  linkedAssetsSelector,
  linkedFilesSelectorByFileId,
} from 'modules/annotations';
import { CogniteFileViewerImage } from 'components/CogniteFileViewer';
import { useResourceActionsContext } from 'context/ResourceActionsContext';

export const FileSmallPreview = ({
  fileId,
  actions: propActions,
  extras,
  children,
}: {
  fileId: number;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  children?: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const renderResourceActions = useResourceActionsContext();
  const { assetIds, assets } = useSelector(linkedAssetsSelector)(fileId);
  const { fileIds, files } = useSelector(linkedFilesSelectorByFileId)(fileId);

  const actions = useMemo(() => {
    console.log('asdfsda');
    const items: React.ReactNode[] = [];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        fileId,
      })
    );
    return items;
  }, [renderResourceActions, fileId, propActions]);

  useEffect(() => {
    (async () => {
      await dispatch(retrieveFiles([{ id: fileId }]));
      await dispatch(listByFileId(fileId));
    })();
  }, [dispatch, fileId]);

  useEffect(() => {
    dispatch(
      retrieveAssets(
        assetIds
          .filter(id => typeof id === 'number')
          .map(id => ({ id } as InternalId))
      )
    );
    dispatch(
      retrieveAssetsExternal(
        assetIds
          .filter(id => typeof id === 'string')
          .map(id => ({ externalId: id } as ExternalId))
      )
    );
  }, [dispatch, assetIds]);
  useEffect(() => {
    dispatch(
      retrieveFiles(
        fileIds
          .filter(id => typeof id === 'number')
          .map(id => ({ id } as InternalId))
      )
    );
    dispatch(
      retrieveFilesExternal(
        fileIds
          .filter(id => typeof id === 'string')
          .map(id => ({ externalId: id } as ExternalId))
      )
    );
  }, [dispatch, fileIds]);

  const file = useSelector(itemSelector)(fileId);
  if (!file) {
    return <Loader />;
  }

  const hasPreview = file.mimeType === 'application/pdf';

  return (
    <FileDetailsAbstract
      key={file.id}
      file={file}
      assets={assets || []}
      files={files || []}
      extras={extras}
      actions={actions}
      imgPreview={hasPreview && <CogniteFileViewerImage fileId={file.id} />}
    >
      {children}
    </FileDetailsAbstract>
  );
};
