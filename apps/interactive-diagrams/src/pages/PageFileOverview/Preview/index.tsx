import React, { useState } from 'react';

import styled from 'styled-components';

import { Metadata } from '@data-exploration/components';
import { FileInfo as DataExplorationFileInfo } from '@data-exploration/containers';

import { Tabs } from '@cognite/cogs.js';
import {
  useRelatedResourceCounts,
  ResourceItem,
} from '@cognite/data-exploration';
import { FileInfo } from '@cognite/sdk';

import { ContextFileViewer as CogniteFileViewer } from '../../../components/CogniteFileViewer';
import { PNID_METRICS, trackUsage } from '../../../utils/Metrics';

import { ResourceDetailTabContent } from './ResourceDetailTabContent';

type FilePreviewTabType = 'preview' | 'details' | 'files' | 'assets';
type Props = {
  file: FileInfo;
  editMode: boolean;
};

export default function Preview(props: Props) {
  const { file, editMode } = props;

  const [activeTab, setActiveTab] = useState<FilePreviewTabType>('preview');

  const resourceDetails: ResourceItem = {
    type: 'file',
    id: file?.id,
    externalId: file?.externalId || '',
  };
  const { counts } = useRelatedResourceCounts(resourceDetails);

  return (
    <TabsWrapper>
      <Tabs
        activeKey={activeTab}
        onTabClick={(newTab) => {
          trackUsage(PNID_METRICS.fileViewer.viewTab, { tab: newTab });
          setActiveTab(newTab as FilePreviewTabType);
        }}
        style={{ paddingLeft: '20px' }}
      >
        <Tabs.Tab tabKey="preview" label="Preview">
          <CogniteFileViewer fileId={file?.id} editMode={editMode} />
        </Tabs.Tab>
        <Tabs.Tab label="Diagram details" tabKey="info">
          <DataExplorationFileInfo file={file} />
          <Metadata metadata={file?.metadata} />
        </Tabs.Tab>
        <Tabs.Tab
          tabKey="assets"
          chipRight={{
            label: `${counts?.asset ?? '-'}`,
            size: 'small',
          }}
          label="Assets"
        >
          <ResourceDetailTabContent resource={resourceDetails} type="asset" />
        </Tabs.Tab>
        <Tabs.Tab
          tabKey="files"
          chipRight={{
            label: `${counts?.file ?? '-'}`,
            size: 'small',
          }}
          label="Diagrams"
        >
          <ResourceDetailTabContent resource={resourceDetails} type="file" />
        </Tabs.Tab>
      </Tabs>
    </TabsWrapper>
  );
}

const TabsWrapper = styled.div`
  height: 100%;
  padding-left: 16px;
  padding-right: 16px;

  .cogs-tabs {
    height: 100%;
  }
`;
