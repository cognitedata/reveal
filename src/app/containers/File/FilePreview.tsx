import React, { useEffect, useContext, useState } from 'react';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { FilePreview as CogniteFilePreview } from 'lib/containers/Files/FilePreview';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Tabs } from 'lib/components';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { FileDetails } from 'lib';
import RelatedResources from 'app/components/Files/RelatedResources';
import RelatedResourceCount from 'app/components/Files/RelatedResourceCount';
import { TitleRowActionsProps } from 'app/components/TitleRowActions';
import { EditFileButton } from 'app/components/TitleRowActions/EditFileButton';
import { usePermissions } from 'lib/hooks/CustomHooks';
import styled from 'styled-components';
import { Colors, Body } from '@cognite/cogs.js';
import { ContextualizationButton } from 'app/components/TitleRowActions/ContextualizationButton';

export const FilePreview = ({
  fileId,
  actions,
}: {
  fileId: number;
  actions?: TitleRowActionsProps['actions'];
}) => {
  const sdk = useSDK();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileId && el.type === 'file'
  );
  const filesAcl = usePermissions('filesAcl', 'WRITE');
  const eventsAcl = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

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
    setEditMode(false);
  }, [fileId]);

  const { data: fileInfo } = useCdfItem<FileInfo>('files', { id: fileId! });

  return (
    <>
      <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
        <ResourceTitleRow
          item={{ id: fileId!, type: 'file' }}
          actions={[
            () => (
              <EditFileButton
                item={{ type: 'file', id: fileId! }}
                isActive={editMode}
                onClick={() => {
                  setEditMode(mode => !mode);
                }}
              />
            ),
            () => (
              <ContextualizationButton item={{ type: 'file', id: fileId! }} />
            ),
            ...actions,
          ]}
        />
        <Tabs tab="preview">
          <Tabs.Pane title="Preview" key="preview">
            {editMode && (
              <Banner>
                <Body level={3}>You have entered editing mode.</Body>
              </Banner>
            )}
            <CogniteFilePreview
              fileId={fileId!}
              creatable={editMode}
              contextualization={writeAccess}
            />
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
                <RelatedResourceCount
                  fileId={fileId!}
                  resourceType="sequence"
                />
              </>
            }
            key="sequences"
          >
            <RelatedResources fileId={fileId!} resourceType="sequence" />
          </Tabs.Pane>
        </Tabs>
      </CogniteFileViewer.Provider>
    </>
  );
};

const Banner = styled.div`
  padding: 16px;
  background: ${Colors['midblue-6'].hex()};
  color: ${Colors.midblue.hex()};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .cogs-body-3 {
    color: ${Colors.midblue.hex()};
  }
`;
