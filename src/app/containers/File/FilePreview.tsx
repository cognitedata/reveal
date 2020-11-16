import React, { useEffect, useContext } from 'react';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { FilePreview as CogniteFilePreview } from 'lib/containers/Files/FilePreview';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Tabs } from 'lib/components';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk/dist/src';
import { FileDetails } from 'lib';
import RelatedResources from 'app/components/Files/RelatedResources';
import RelatedResourceCount from 'app/components/Files/RelatedResourceCount';
import { TitleRowActionsProps } from 'app/components/TitleRowActions';

export const FilePreview = ({
  fileId,
  actions,
}: {
  fileId: number;
  actions?: TitleRowActionsProps['actions'];
}) => {
  const sdk = useSDK();
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const { hidePreview } = useResourcePreview();
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileId && el.type === 'file'
  );

  useEffect(() => {
    if (fileId && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: fileId, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileId, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.File', { fileId });
    hidePreview();
  }, [fileId, hidePreview]);

  const { data: fileInfo } = useCdfItem<FileInfo>('files', { id: fileId! });

  return (
    <>
      <ResourceTitleRow
        item={{ id: fileId!, type: 'file' }}
        icon="Document"
        actions={actions}
      />
      <Tabs tab="preview">
        <Tabs.Pane title="Preview" key="preview">
          <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
            <div style={{ display: 'flex', flex: 1 }}>
              <CogniteFilePreview
                fileId={fileId!}
                creatable={false}
                contextualization={false}
              />
            </div>
          </CogniteFileViewer.Provider>
        </Tabs.Pane>
        <Tabs.Pane title="File details" key="info">
          {fileInfo && <FileDetails file={fileInfo} />}
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Assets{' '}
              <RelatedResourceCount fileId={fileId!} resourceType="asset" />
            </>
          }
          key="assets"
        >
          <RelatedResources fileId={fileId!} resourceType="asset" />
        </Tabs.Pane>

        <Tabs.Pane
          title={
            <>
              Files{' '}
              <RelatedResourceCount fileId={fileId!} resourceType="file" />
            </>
          }
          key="files"
        >
          <RelatedResources fileId={fileId!} resourceType="file" />
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Time series{' '}
              <RelatedResourceCount
                fileId={fileId!}
                resourceType="timeSeries"
              />
            </>
          }
          key="timeseries"
        >
          <RelatedResources fileId={fileId!} resourceType="timeSeries" />
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Events{' '}
              <RelatedResourceCount fileId={fileId!} resourceType="event" />
            </>
          }
          key="events"
        >
          <RelatedResources fileId={fileId!} resourceType="event" />
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Sequences{' '}
              <RelatedResourceCount fileId={fileId!} resourceType="sequence" />
            </>
          }
          key="sequences"
        >
          <RelatedResources fileId={fileId!} resourceType="sequence" />
        </Tabs.Pane>
      </Tabs>
    </>
  );
};
