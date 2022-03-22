import React, { useEffect, useContext } from 'react';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import {
  FilePreview as CogniteFilePreview,
  ErrorFeedback,
  Loader,
} from '@cognite/data-exploration';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import isMatch from 'lodash/isMatch';
import { Flex } from 'components/Common';
import { Alert } from 'antd';
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
  const { flow } = getFlow();
  const { data: filesAcl } = usePermissions(flow, 'filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions(flow, 'eventsAcl', 'WRITE');
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

  const {
    data: fileInfo,
    isFetched,
    isError,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileId!,
  });

  if (!isFetched) {
    return <Loader />;
  }

  if (isError) {
    return <ErrorFeedback error={error} />;
  }

  if (!fileInfo) {
    return (
      <Alert message={`File ${fileId} not found`} type="warning" closable />
    );
  }

  return (
    <Flex column style={{ flex: '1' }}>
      <CogniteFilePreview
        fileId={fileId!}
        creatable={editMode}
        contextualization={writeAccess}
        fileIcon={<InteractiveIcon />}
      />
    </Flex>
  );
};
