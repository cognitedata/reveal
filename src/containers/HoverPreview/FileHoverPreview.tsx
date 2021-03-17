import React, { useEffect } from 'react';
import { FileInfo, InternalId, ExternalId } from '@cognite/sdk';
import { FileDetailsAbstract } from 'components/Common';
import { useSelector, useDispatch } from 'react-redux';
import {
  retrieveItemsById as retrieveFiles,
  retrieveItemsByExternalId as retrieveFilesExternal,
} from 'modules/files';
import {
  retrieveItemsById as retrieveAssets,
  retrieveItemsByExternalId as retrieveAssetsExternal,
} from 'modules/assets';
import {
  listAnnotationsByFileId,
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
  file: FileInfo;
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
    dispatch(retrieveFiles({ ids: [{ id: file.id }] }));
    dispatch(listAnnotationsByFileId({ fileId: file.id }));
  }, [dispatch, file.id]);

  useEffect(() => {
    const ids = {
      ids: assetIds
        .filter((id: number | string) => typeof id === 'number')
        .map((id: number) => ({ id } as InternalId)),
    };
    const externalIds = {
      ids: assetIds
        .filter((id: number | string) => typeof id === 'string')
        .map((id: string) => ({ externalId: id } as ExternalId)),
    };
    dispatch(retrieveAssets(ids));
    dispatch(retrieveAssetsExternal(externalIds));
  }, [dispatch, assetIds]);

  useEffect(() => {
    const ids = {
      ids: fileIds
        .filter((id: number | string) => typeof id === 'number')
        .map((id: number) => ({ id } as InternalId)),
    };
    const externalIds = {
      ids: fileIds
        .filter((id: number | string) => typeof id === 'string')
        .map((id: string) => ({ externalId: id } as ExternalId)),
    };
    dispatch(retrieveFiles(ids));
    dispatch(retrieveFilesExternal(externalIds));
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
