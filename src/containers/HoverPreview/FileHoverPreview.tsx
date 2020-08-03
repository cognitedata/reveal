import React, { useEffect } from 'react';
import { FilesMetadata, InternalId, ExternalId } from '@cognite/sdk';
import { FileDetailsAbstract } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import {
  retrieve as retrieveFiles,
  retrieveExternal as retrieveFilesExternal,
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
import { Button } from '@cognite/cogs.js';
import { onResourceSelected } from 'modules/app';
import { useHistory } from 'react-router-dom';

export const FileHoverPreview = ({
  file,
  actions,
  extras,
  disableSidebarToggle = false,
}: {
  file: FilesMetadata;
  actions?: React.ReactNode[];
  extras?: React.ReactNode[];
  disableSidebarToggle?: boolean;
}) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { assetIds, assets } = useSelector(linkedAssetsSelector)(file.id);
  const { fileIds, files } = useSelector(linkedFilesSelectorByFileId)(file.id);

  const hasPreview = file.mimeType === 'application/pdf';

  useEffect(() => {
    (async () => {
      await dispatch(retrieveFiles([{ id: file.id }]));
      await dispatch(listByFileId(file.id));
    })();
  }, [dispatch, file.id]);

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

  return (
    <FileDetailsAbstract
      key={file.id}
      file={file}
      assets={assets || []}
      files={files || []}
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
                        fileId: file.id,
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
      imgPreview={hasPreview && <CogniteFileViewerImage fileId={file.id} />}
    />
  );
};
