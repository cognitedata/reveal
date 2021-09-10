import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Divider } from 'antd';
import { Button, Title, Badge, Colors, Dropdown } from '@cognite/cogs.js';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { useSteps, useActiveWorkflow } from 'hooks';
import { WorkflowStep } from 'modules/workflows';
import { retrieveItemsById as retrieve } from 'modules/files';
import { MenuSingle } from 'containers';
import { Flex } from 'components/Common';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import { ContextFileViewer as CogniteFileViewer } from 'components/CogniteFileViewer';
import {
  ErrorFeedback,
  Loader,
  Tabs,
  FileDetails,
  Metadata,
  useRelatedResourceCounts,
  ResourceItem,
} from '@cognite/data-exploration';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import {
  Wrapper,
  ContentWrapper,
  TitleRowWrapper,
  TabTitle,
} from './components';
import TitleRowActions from './TitleRowActions';
import { ResourceDetailTabContent } from './ResourceDetailTabContent';
import { EditFileButton } from './EditFileButton';
import { ClearTagsButton } from './ClearTagsButton';

export type FilePreviewTabType = 'preview' | 'details' | 'files' | 'assets';

type Props = {
  step: WorkflowStep;
};

export default function PageFileOverview(props: Props) {
  const dispatch = useDispatch();
  const { step } = props;
  const { fileId } = useParams<{ fileId: string }>();
  const { goToPrevStep } = useSteps(step);
  const [activeTab, setActiveTab] = useState<FilePreviewTabType>('preview');
  const [editMode, setEditMode] = useState<boolean>(false);

  useActiveWorkflow(step);

  const fileIdNumber = Number(fileId);
  if (!fileIdNumber) goToPrevStep();

  const {
    data: fileInfo,
    isFetched,
    isError,
    error,
  } = useCdfItem<FileInfo>('files', {
    id: fileIdNumber,
  });
  const resourceDetails: ResourceItem = {
    type: 'file',
    id: fileIdNumber,
    externalId: fileInfo?.externalId || '',
  };
  const { counts } = useRelatedResourceCounts(resourceDetails);

  useEffect(() => {
    dispatch(retrieve({ ids: [{ id: fileIdNumber }] }));
  }, [dispatch, fileIdNumber]);

  if (!isFetched) return <Loader />;
  if (isError) return <ErrorFeedback error={error} />;
  if (!fileInfo) return <>File {fileId} not found!</>;

  return (
    <Wrapper>
      <TitleRowWrapper>
        <Flex align justify>
          <Button
            icon="ArrowBack"
            aria-label="Button-Back"
            onClick={() => goToPrevStep()}
          >
            Back
          </Button>
          <Divider type="vertical" style={{ height: '36px' }} />
        </Flex>
        <Title level={3} style={{ flex: 1 }}>
          {fileInfo.name}
        </Title>
        <div
          style={{
            display: 'inline-block',
            overflow: 'hidden',
          }}
        >
          <TitleRowActions
            actions={
              <>
                <EditFileButton
                  item={{ type: 'file', id: fileIdNumber }}
                  isActive={editMode}
                  onClick={() => {
                    setEditMode((mode) => !mode);
                  }}
                />
                <ClearTagsButton id={fileIdNumber} setEditMode={setEditMode} />
                <Dropdown content={<MenuSingle file={fileInfo} />}>
                  <Button
                    icon="MoreOverflowEllipsisHorizontal"
                    aria-label="Button-More-All"
                    type="secondary"
                  />
                </Dropdown>
              </>
            }
          />
        </div>
      </TitleRowWrapper>
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
            <CogniteFileViewer fileId={fileIdNumber} editMode={editMode} />
          </ContentWrapper>
        </Tabs.Pane>
        <Tabs.Pane title={<TabTitle>File details</TabTitle>} key="info">
          <FileDetails file={fileInfo} />
          <Metadata metadata={fileInfo.metadata} />
        </Tabs.Pane>
        <Tabs.Pane
          key="assets"
          title={
            <>
              <TabTitle>Assets</TabTitle>
              <Badge
                text={counts.asset}
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
                text={counts.file}
                background={Colors['greyscale-grey3'].hex()}
              />
            </>
          }
        >
          <ResourceDetailTabContent resource={resourceDetails} type="file" />
        </Tabs.Pane>
      </Tabs>
      <ResourceSidebar />
    </Wrapper>
  );
}
