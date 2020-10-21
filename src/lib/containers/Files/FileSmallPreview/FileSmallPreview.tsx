import React, { useMemo } from 'react';
import { FileInfo, Asset } from '@cognite/sdk';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import styled from 'styled-components';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import uniq from 'lodash/uniq';
import { Loader } from 'lib/components';
import { isFilePreviewable } from 'lib/utils/FileUtils';
import { useResourceActionsContext } from 'lib/context';
import { useSelectionButton } from 'lib/hooks/useSelection';
import { getIdParam } from 'lib/helpers';
import { FileDetailsAbstract } from 'lib/containers/Files';
import { useAnnotations } from '../hooks';

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
  const sdk = useSDK();
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton()({
    type: 'file',
    id: fileId,
  });

  const { data: file } = useCdfItem<FileInfo>('files', { id: fileId });

  const annotations = useAnnotations(fileId);

  const fileIds = annotations
    .map(a =>
      a.resourceType === 'file' ? a.resourceExternalId || a.resourceId : false
    )
    .filter(Boolean) as (number | string)[];
  const assetIds = annotations
    .map(a =>
      a.resourceType === 'asset' ? a.resourceExternalId || a.resourceId : false
    )
    .filter(Boolean) as (number | string)[];

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

  const { data: files } = useCdfItems<FileInfo>(
    'files',
    uniq(fileIds).map(getIdParam),
    { enabled: fileIds.length > 0 }
  );
  const { data: assets } = useCdfItems<Asset>(
    'assets',
    uniq(assetIds).map(getIdParam),
    { enabled: assetIds.length > 0 }
  );

  const hasPreview = isFilePreviewable(file);

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
