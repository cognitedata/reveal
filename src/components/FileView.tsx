import React, { useEffect, useContext, useState } from 'react';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import {
  FilePreview as CogniteFilePreview,
  ErrorFeedback,
  Loader,
} from '@cognite/data-exploration';
import { trackUsage } from 'utils/Metrics';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import isMatch from 'lodash/isMatch';

export type FilePreviewTabType =
  | 'preview'
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'assets';

export const FilePreview = ({ fileId }: { fileId: number }) => {
  const sdk = useSDK();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    (el: { state: string; id: number; type: string }) =>
      isMatch(el, { state: 'active', id: fileId, type: 'file' })
  );
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  useEffect(() => {
    if (fileId && !isActive) {
      setResourcesState(
        resourcesState
          .filter((el) => el.state !== 'active')
          .concat([{ id: fileId, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileId, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.Preview.File', { fileId });
    setEditMode(false);
  }, [fileId]);

  const { data: fileInfo, isFetched, isError, error } = useCdfItem<FileInfo>(
    'files',
    {
      id: fileId!,
    }
  );

  if (!isFetched) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorFeedback error={error} />;
  }

  if (!fileInfo) {
    return <>File {fileId} not found!</>;
  }

  return (
    <>
      <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CogniteFilePreview
            fileId={fileId!}
            creatable={editMode}
            contextualization={writeAccess}
          />
        </div>
      </CogniteFileViewer.Provider>
    </>
  );
};
