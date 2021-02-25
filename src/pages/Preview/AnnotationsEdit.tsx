import React from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Button, Title } from '@cognite/cogs.js';
import { FilePreview } from 'src/pages/Preview/components/FilePreview/FilePreview';
import { Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/pages/Preview/components/Contextualization/Contextualization';
import { FileDetailsComp } from 'src/pages/Preview/components/FileDetails/FileDetailsComp';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { AnnotationJobCompleted } from 'src/api/types';

const Container = styled.div`
  width: 100%;
  padding: 20px 50px;
  height: 100%;
  display: grid;
  grid-template-rows: 60px 60px auto;
`;
const TitleRow = styled.div`
  padding: 12px;
  width: 100%;
`;

const ToolBar = styled.div`
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 70px auto 130px 150px;
  grid-column-gap: 16px;
`;

const AnnotationContainer = styled.div`
  width: 100%;
  margin: 20px 0;
  display: flex;
`;

const FilePreviewMetadataContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 50% auto;
  grid-column-gap: 30px;
`;

const TabsContainer = styled.div`
  padding: 30px 45px;
  border-radius: 8px;
`;

const AnnotationsEdit = (props: RouteComponentProps<{ fileId: string }>) => {
  const history = useHistory();
  const { fileId } = props.match.params;

  const file = useSelector((state: RootState) => {
    // yeah I know repeating doesn't look good, perhaps it worth merging of these processSlice and uploadedFilesSlice
    return state.uploadedFiles.uploadedFiles.find(
      (f) => f.id === parseInt(fileId, 10)
    );
  });

  const annotations = useSelector(({ processSlice }: RootState) => {
    const job = processSlice.jobByFileId[fileId] as AnnotationJobCompleted;

    if (job) {
      return AnnotationUtils.convertToAnnotations(job.items[0].annotations);
    }
    return [];
  });

  if (!file) {
    // navigate to upload step if file is not available(if the user uses a direct link)
    history.push(getLink(workflowRoutes.upload));
    return null;
  }

  const onBackButtonClick = () => {
    history.goBack();
  };

  return (
    <>
      <PageTitle title="Edit Annotations" />
      <Container>
        <TitleRow>
          <Title level={3}>Edit Annotations and Enrich File</Title>
        </TitleRow>
        <ToolBar className="z-4">
          <Button type="secondary" shape="round" onClick={onBackButtonClick}>
            Back
          </Button>
          <Title level={3}>{file?.name}</Title>
          <Button type="secondary" icon="Delete">
            Delete file
          </Button>
          <Button type="primary" shape="round" icon="Upload">
            Save To CDF
          </Button>
        </ToolBar>
        <AnnotationContainer>
          <FilePreviewMetadataContainer>
            <div>
              {file && <FilePreview fileObj={file} annotations={annotations} />}
            </div>
            <TabsContainer className="z-8">
              <Tabs
                tab="context"
                onTabChange={() => {}}
                style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}
              >
                <Tabs.Pane title="Contextualization" key="context">
                  <Contextualization annotations={annotations} />
                </Tabs.Pane>
                <Tabs.Pane title="File Details" key="file-detail">
                  <div>{file && <FileDetailsComp fileObj={file} />}</div>
                </Tabs.Pane>
              </Tabs>
            </TabsContainer>
          </FilePreviewMetadataContainer>
        </AnnotationContainer>
      </Container>
    </>
  );
};
export default AnnotationsEdit;
