import React, { useState } from 'react';
import { Badge, Colors } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import {
  Tabs,
  FileDetails,
  Metadata,
  useRelatedResourceCounts,
  ResourceItem,
} from '@cognite/data-exploration';
import { ContextFileViewer as CogniteFileViewer } from 'components/CogniteFileViewer';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { ContentWrapper, TabTitle } from '../components';
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
    <Tabs
      tab={activeTab}
      onTabChange={(newTab) => {
        trackUsage(PNID_METRICS.fileViewer.viewTab, { tab: newTab });
        setActiveTab(newTab as FilePreviewTabType);
      }}
      style={{ paddingLeft: '20px' }}
    >
      <Tabs.Pane key="preview" title={<TabTitle>Preview</TabTitle>}>
        <ContentWrapper>
          <CogniteFileViewer fileId={file?.id} editMode={editMode} />
        </ContentWrapper>
      </Tabs.Pane>
      <Tabs.Pane title={<TabTitle>Diagram details</TabTitle>} key="info">
        <FileDetails file={file} />
        <Metadata metadata={file?.metadata} />
      </Tabs.Pane>
      <Tabs.Pane
        key="assets"
        title={
          <>
            <TabTitle>Assets</TabTitle>
            <Badge
              text={counts?.asset ?? '—'}
              background={Colors['greyscale-grey3'].hex()}
            />
          </>
        }
      >
        <ResourceDetailTabContent resource={resourceDetails} type="asset" />
      </Tabs.Pane>
      <Tabs.Pane
        key="files"
        title={
          <>
            <TabTitle>Diagrams</TabTitle>
            <Badge
              text={counts?.file ?? '—'}
              background={Colors['greyscale-grey3'].hex()}
            />
          </>
        }
      >
        <ResourceDetailTabContent resource={resourceDetails} type="file" />
      </Tabs.Pane>
    </Tabs>
  );
}
