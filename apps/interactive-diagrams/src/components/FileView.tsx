import React, { useEffect, useContext } from 'react';

import { Alert } from 'antd';
import isMatch from 'lodash/isMatch';

import { Icon } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';

import { FilePreview as CogniteFilePreview } from '@data-exploration-components';

import { APPLICATION_ID } from '../constants';
import { ResourceSelectionContext } from '../context';

import InteractiveIcon from './InteractiveIcon';

export type FilePreviewTabType =
  | 'preview'
  | 'details'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events'
  | 'assets';

export const FilePreview = ({
  fileId,
  editMode,
}: {
  fileId: number;
  editMode: boolean;
}) => {
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );

  const isActive = resourcesState.some(
    (el: { state: string; id: number; type: string }) =>
      isMatch(el, { state: 'active', id: fileId, type: 'file' })
  );
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: annotationsAcl } = usePermissions('annotationsAcl', 'WRITE');
  // TODO: remove events:write once the migration to Annotations API is completed
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl && annotationsAcl;

  useEffect(() => {
    if (fileId && !isActive) {
      setResourcesState(
        resourcesState
          .filter((el) => el.state !== 'active')
          .concat([{ id: fileId, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileId, setResourcesState]);

  const {
    data: fileInfo,
    isFetched,
    isError,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileId!,
  });

  if (!isFetched) {
    return <Icon size={40} css={{ margin: '12px auto 0' }} type="Loader" />;
  }

  if (isError) {
    return (
      <ErrorFeedback
        error={{
          message: error.message || '',
          status: 0,
        }}
      />
    );
  }

  if (!fileInfo) {
    return (
      <Alert message={`File ${fileId} not found`} type="warning" closable />
    );
  }

  return (
    <CogniteFilePreview
      id={`${APPLICATION_ID}-${fileId}`}
      applicationId={APPLICATION_ID}
      key={fileId}
      fileId={fileId!}
      creatable={editMode}
      contextualization={writeAccess}
      fileIcon={<InteractiveIcon />}
    />
  );
};
