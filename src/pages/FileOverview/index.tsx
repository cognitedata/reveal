import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Divider, Space } from 'antd';
import { Button, Title, Badge, Colors } from '@cognite/cogs.js';
import { RootState } from 'store';
import { useCdfItem, usePermissions } from '@cognite/sdk-react-query-hooks';
import { FileInfo } from '@cognite/sdk';
import { useActiveWorkflow } from 'hooks';
import { WorkflowStep } from 'modules/workflows';
import { startConvertFileToSvgJob } from 'modules/contextualization/uploadJobs';
import { retrieveItemsById as retrieve } from 'modules/files';
import { reviewPage } from 'routes/paths';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import { ContextFileViewer as CogniteFileViewer } from 'components/CogniteFileViewer';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { convertEventsToAnnotations } from '@cognite/annotations';
import {
  ErrorFeedback,
  Loader,
  Tabs,
  FileDetails,
  Metadata,
  useRelatedResourceCounts,
  ResourceItem,
  useAnnotations,
} from '@cognite/data-exploration';
import { AppStateContext } from 'context';
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

export default function FileOverview(props: Props) {
  const { step } = props;
  const { fileId } = useParams<{
    fileId: string;
  }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const { tenant } = useContext(AppStateContext);
  const { workflowId } = useActiveWorkflow(step);

  const [activeTab, setActiveTab] = useState<FilePreviewTabType>('preview');
  const [renderFeedback, setRenderFeedback] = useState(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const fileIdNumber = Number(fileId);

  const { data: annotations } = useAnnotations(fileIdNumber);

  const { data: fileInfo, isFetched, isError, error } = useCdfItem<FileInfo>(
    'files',
    {
      id: fileIdNumber,
    }
  );

  const { jobStarted } = useSelector(
    (state: RootState) => state.contextualization.uploadJobs[fileIdNumber] || {}
  );

  useEffect(() => {
    dispatch(retrieve({ ids: [{ id: fileIdNumber }] }));
  }, [dispatch, fileIdNumber]);

  const BackButton = () => (
    <div
      style={{
        display: 'inline-block',
        overflow: 'hidden',
      }}
    >
      <Space>
        <Button
          icon="ArrowBack"
          onClick={() => history.push(reviewPage.path(tenant, workflowId))}
        >
          Back
        </Button>{' '}
        <Divider type="vertical" style={{ height: '36px' }} />
      </Space>
    </div>
  );
  const { data: canEditFiles } = usePermissions('filesAcl', 'WRITE');

  const resourceDetails: ResourceItem = {
    type: 'file',
    id: fileIdNumber,
    externalId: fileInfo?.externalId || '',
  };

  const { counts } = useRelatedResourceCounts(resourceDetails);

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
    <Wrapper>
      {renderFeedback && (
        <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
      )}
      <TitleRowWrapper>
        <BackButton />
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
                <Button
                  shape="round"
                  style={{ marginRight: '0px' }}
                  loading={jobStarted}
                  onClick={() => {
                    if (canEditFiles) {
                      trackUsage(PNID_METRICS.fileViewer.convertToSvg, {
                        fileId: fileIdNumber,
                        annotationsCount: annotations.length,
                      });
                      if (annotations) {
                        dispatch(
                          startConvertFileToSvgJob(
                            fileIdNumber,
                            convertEventsToAnnotations(annotations)
                          )
                        );
                      }
                    } else {
                      setRenderFeedback(true);
                    }
                  }}
                >
                  Create SVG
                </Button>
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
