import React, { useEffect, useMemo } from 'react';
import { InternalId, ExternalId } from '@cognite/sdk';
import { FileDetailsAbstract, Loader } from 'components/Common';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import {
  retrieve as retrieveFiles,
  retrieveExternal as retrieveFilesExternal,
  itemSelector,
} from '@cognite/cdf-resources-store/dist/files';
import {
  retrieve as retrieveAssets,
  retrieveExternal as retrieveAssetsExternal,
} from '@cognite/cdf-resources-store/dist/assets';
import {
  listByFileId,
  linkedAssetsSelector,
  linkedFilesSelectorByFileId,
  selectAnnotations,
} from 'modules/annotations';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';
import { isPreviewableImage } from 'utils/FileUtils';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { getSDK } from 'utils/SDK';

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
  const dispatch = useResourcesDispatch();
  const sdk = getSDK();
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'file',
    id: fileId,
  });
  const { assetIds, assets } = useResourcesSelector(linkedAssetsSelector)(
    fileId
  );
  const { fileIds, files } = useResourcesSelector(linkedFilesSelectorByFileId)(
    fileId
  );
  const getAnnotations = useResourcesSelector(selectAnnotations);
  const annotations = useMemo(() => getAnnotations(fileId), [
    fileId,
    getAnnotations,
  ]);

  const actions = useMemo(() => {
    const items: React.ReactNode[] = [selectionButton];
    items.push(...(propActions || []));
    items.push(
      ...renderResourceActions({
        id: fileId,
        type: 'file',
      })
    );
    return items;
  }, [selectionButton, renderResourceActions, fileId, propActions]);

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

  const file = useResourcesSelector(itemSelector)(fileId);

  const hasPreview = useMemo(
    () =>
      file
        ? file.mimeType === 'application/pdf' || isPreviewableImage(file)
        : false,
    [file]
  );
  if (!file) {
    return <Loader />;
  }

  return (
    <FileDetailsAbstract
      key={file.id}
      file={file}
      assets={assets || []}
      files={files || []}
      extras={extras}
      actions={actions}
      imgPreview={
        hasPreview && (
          <Preview>
            <CogniteFileViewer
              file={file}
              sdk={sdk}
              disableAutoFetch
              hideControls
              hideDownload
              hideSearch
              annotations={annotations}
              pagination="small"
            />
          </Preview>
        )
      }
    >
      {children}
    </FileDetailsAbstract>
  );
};

const Preview = styled.div`
  height: 300px;
`;
