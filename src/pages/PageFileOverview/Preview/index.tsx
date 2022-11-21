import React, { useState } from 'react';
import { Badge, Colors, Tabs } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import {
  FileDetails,
  Metadata,
  useRelatedResourceCounts,
  ResourceItem,
} from '@cognite/data-exploration';
import { ContextFileViewer as CogniteFileViewer } from 'components/CogniteFileViewer';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { ContentWrapper, TabTitle } from '../components';
import { ResourceDetailTabContent } from './ResourceDetailTabContent';
import styled from 'styled-components';

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
    <StyledTabs
      activeKey={activeTab}
      onChange={(newTab) => {
        trackUsage(PNID_METRICS.fileViewer.viewTab, { tab: newTab });
        setActiveTab(newTab as FilePreviewTabType);
      }}
      style={{ paddingLeft: '20px' }}
    >
      <Tabs.TabPane key="preview" tab={<TabTitle>Preview</TabTitle>}>
        <ContentWrapper>
          <CogniteFileViewer fileId={file?.id} editMode={editMode} />
        </ContentWrapper>
      </Tabs.TabPane>
      <Tabs.TabPane tab={<TabTitle>Diagram details</TabTitle>} key="info">
        <FileDetails file={file} />
        <Metadata metadata={file?.metadata} />
      </Tabs.TabPane>
      <Tabs.TabPane
        key="assets"
        tab={
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
      </Tabs.TabPane>
      <Tabs.TabPane
        key="files"
        tab={
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
      </Tabs.TabPane>
    </StyledTabs>
  );
}

export const StyledTabs = styled(Tabs)`
  padding-left: 16px;
  padding-right: 16px;
  flex: 1;
  height: 100%;

  .rc-tabs-nav-wrap {
    border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
    margin-bottom: 16px;
  }
  .rc-tabs-content-holder {
    display: flex;
    /* We need to consider the height of the tab switcher part at the top which is 48px in height */
    height: calc(100% - 48px);
    overflow: auto;
  }
`;
