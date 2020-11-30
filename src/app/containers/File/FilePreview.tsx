import React, { useEffect, useContext, useState } from 'react';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { FilePreview as CogniteFilePreview } from 'lib/containers/Files/FilePreview';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { FileDetails } from 'lib';
import Metadata from 'lib/components/Details/Metadata';
import { EditFileButton } from 'app/components/TitleRowActions/EditFileButton';
import { usePermissions } from 'lib/hooks/CustomHooks';
import styled from 'styled-components';
import { Colors, Body } from '@cognite/cogs.js';
import { ContextualizationButton } from 'app/components/TitleRowActions/ContextualizationButton';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { useRouteMatch, useLocation, useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

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
  actions,
}: {
  fileId: number;
  actions?: React.ReactNode;
}) => {
  const sdk = useSDK();
  const [editMode, setEditMode] = useState<boolean>(false);
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileId && el.type === 'file'
  );
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const activeTab = location.pathname
    .replace(match.url, '')
    .slice(1) as FilePreviewTabType;

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
        <ResourceTitleRow
          actionWidth={920}
          item={{ id: fileId!, type: 'file' }}
          beforeDefaultActions={
            <>
              <EditFileButton
                item={{ type: 'file', id: fileId! }}
                isActive={editMode}
                onClick={() => {
                  setEditMode(mode => !mode);
                }}
              />

              <ContextualizationButton item={{ type: 'file', id: fileId! }} />
            </>
          }
          afterDefaultActions={actions}
        />
        <div
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ResourceDetailsTabs
            parentResource={{
              type: 'file',
              id: fileId,
              externalId: fileInfo.externalId,
            }}
            tab={activeTab}
            onTabChange={newTab => {
              history.push(
                createLink(
                  `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                )
              );
              trackUsage('Exploration.Details.TabChange', {
                type: 'file',
                tab: newTab,
              });
            }}
            additionalTabs={[
              <Tabs.Pane title={<TabTitle>Preview</TabTitle>} key="preview">
                {editMode && (
                  <Banner>
                    <Body level={3}>You have entered editing mode.</Body>
                  </Banner>
                )}
                <div
                  style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  <CogniteFilePreview
                    fileId={fileId!}
                    creatable={editMode}
                    contextualization={writeAccess}
                  />
                </div>
              </Tabs.Pane>,
              <Tabs.Pane title={<TabTitle>File details</TabTitle>} key="info">
                <FileDetails file={fileInfo} />
                <Metadata metadata={fileInfo.metadata} />
              </Tabs.Pane>,
            ]}
          />
        </div>
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
