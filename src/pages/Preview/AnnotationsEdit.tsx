import React, { useEffect } from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import styled from 'styled-components';
import { Button, Title } from '@cognite/cogs.js';
import { FilePreview } from 'src/pages/Preview/components/FilePreview/FilePreview';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/pages/Preview/components/Contextualization/Contextualization';
import { FileDetailEdit } from 'src/pages/Preview/components/FileDetails/FileDetailEdit';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  resetEditHistory,
  selectNonRejectedAnnotations,
  selectVisibleAnnotationsByFileId,
} from 'src/store/previewSlice';
import { selectFileById } from 'src/store/uploadedFilesSlice';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';

const Container = styled.div`
  width: 100%;
  padding: 20px 50px;
  height: 100%;
  display: grid;
  grid-template-rows: 60px 60px calc(100% - 120px);
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
  padding: 20px 0 0;
  display: flex;
  height: 100%;
  box-sizing: border-box;
`;

const FilePreviewMetadataContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 50% auto;
  grid-template-rows: 100%;
  grid-column-gap: 30px;
`;

const FilePreviewContainer = styled.div`
  height: 100%;
`;

const TabsContainer = styled.div`
  height: 100%;
  padding: 30px 45px 0;
  border-radius: 8px;
`;

const queryClient = new QueryClient();

const AnnotationsEdit = (props: RouteComponentProps<{ fileId: string }>) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { fileId } = props.match.params;

  const file = useSelector(({ uploadedFiles }: RootState) =>
    selectFileById(uploadedFiles, fileId)
  );

  const nonRejectedAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectNonRejectedAnnotations(previewSlice, fileId)
  );

  const visibleAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectVisibleAnnotationsByFileId(previewSlice, fileId)
  );

  if (!file) {
    // navigate to upload step if file is not available(if the user uses a direct link)
    history.push(getLink(workflowRoutes.upload));
    return null;
  }

  const onBackButtonClick = () => {
    history.push(getLink(workflowRoutes.process));
  };

  useEffect(() => {
    dispatch(resetEditHistory());
  });

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
            <FilePreviewContainer>
              {file && (
                <FilePreview fileObj={file} annotations={visibleAnnotations} />
              )}
            </FilePreviewContainer>
            <TabsContainer className="z-8">
              <Tabs
                tab="context"
                onTabChange={() => {}}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '20px',
                }}
              >
                <Tabs.Pane
                  title="Contextualization"
                  key="context"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  <Contextualization annotations={nonRejectedAnnotations} />
                </Tabs.Pane>
                <Tabs.Pane
                  title="File Details"
                  key="file-detail"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  {file && (
                    <DataExplorationProvider sdk={sdk}>
                      <QueryClientProvider client={queryClient}>
                        <FileDetailEdit fileObj={file} />
                      </QueryClientProvider>
                    </DataExplorationProvider>
                  )}
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
