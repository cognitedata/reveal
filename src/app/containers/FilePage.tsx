import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { FilePreview } from 'lib/containers/Files/FilePreview';
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

export const FilePage = () => {
  const sdk = useSDK();
  const { id } = useParams<{
    id: string | undefined;
  }>();
  const fileIdNumber = id ? parseInt(id, 10) : undefined;
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const { hidePreview } = useResourcePreview();
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileIdNumber && el.type === 'file'
  );

  useEffect(() => {
    if (fileIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: fileIdNumber, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileIdNumber, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.File', { fileId: fileIdNumber });
    hidePreview();
  }, [fileIdNumber, hidePreview]);

  const invalidId =
    !id || id.length === 0 || !fileIdNumber || Number.isNaN(fileIdNumber);

  const { data: fileInfo } = useCdfItem<FileInfo>(
    'files',
    { id: fileIdNumber! },
    { enabled: !invalidId }
  );

  if (invalidId) {
    return null;
  }

  return (
    <>
      <ResourceTitleRow id={fileIdNumber!} type="file" icon="Document" />
      <Tabs tab="preview">
        <Tabs.Pane title="Preview" key="preview">
          <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
            <div style={{ display: 'flex', flex: 1 }}>
              <FilePreview
                fileId={fileIdNumber!}
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
              <RelatedResourceCount
                fileId={fileIdNumber!}
                resourceType="asset"
              />
            </>
          }
          key="assets"
        >
          <RelatedResources fileId={fileIdNumber!} resourceType="asset" />
        </Tabs.Pane>

        <Tabs.Pane
          title={
            <>
              Files{' '}
              <RelatedResourceCount
                fileId={fileIdNumber!}
                resourceType="file"
              />
            </>
          }
          key="files"
        >
          <RelatedResources fileId={fileIdNumber!} resourceType="file" />
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Time series{' '}
              <RelatedResourceCount
                fileId={fileIdNumber!}
                resourceType="timeSeries"
              />
            </>
          }
          key="timeseries"
        >
          <RelatedResources fileId={fileIdNumber!} resourceType="timeSeries" />
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Events{' '}
              <RelatedResourceCount
                fileId={fileIdNumber!}
                resourceType="event"
              />
            </>
          }
          key="events"
        >
          <RelatedResources fileId={fileIdNumber!} resourceType="event" />
        </Tabs.Pane>
        <Tabs.Pane
          title={
            <>
              Sequences{' '}
              <RelatedResourceCount
                fileId={fileIdNumber!}
                resourceType="sequence"
              />
            </>
          }
          key="sequences"
        >
          <RelatedResources fileId={fileIdNumber!} resourceType="sequence" />
        </Tabs.Pane>
      </Tabs>
    </>
  );
};
