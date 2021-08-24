import React, { useState } from 'react';
import styled from 'styled-components';
import { DataExplorationProvider, Tabs } from '@cognite/data-exploration';
import { Contextualization } from 'src/modules/Review/Containers/Contextualization';
import { FileDetailsReview } from 'src/modules/FileDetails/Containers/FileDetailsReview/FileDetailsReview';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  selectOtherAnnotationsByFileIdModelType,
  selectTagAnnotationsByFileIdModelType,
} from 'src/modules/Review/previewSlice';
import { QueryClient, QueryClientProvider } from 'react-query';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ImagePreview } from 'src/modules/Review/Containers/ImagePreview';
import { Title } from '@cognite/cogs.js';
import { selectAllFiles } from 'src/modules/Common/filesSlice';
import { ThumbnailCarousel } from '../Components/ThumbnailCarousel/ThumbnailCarousel';

const queryClient = new QueryClient();

const ImageReview = (props: { file: FileInfo; prev: string | undefined }) => {
  const { file, prev } = props;
  const [inFocus, setInFocus] = useState<boolean>(false);
  const tagAnnotations = useSelector(({ previewSlice }: RootState) =>
    selectTagAnnotationsByFileIdModelType(previewSlice, file.id.toString())
  );

  const allFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const gdprAndTextAndObjectAnnotations = useSelector(
    ({ previewSlice }: RootState) =>
      selectOtherAnnotationsByFileIdModelType(previewSlice, file.id.toString())
  );

  const onEditMode = (mode: boolean) => {
    setInFocus(mode);
  };

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AnnotationContainer id="annotationContainer">
          <FilePreviewContainer>
            <PreviewContainer
              fullHeight={allFiles.length === 1}
              inFocus={inFocus}
            >
              {file && <ImagePreview file={file} onEditMode={onEditMode} />}
            </PreviewContainer>
            {allFiles.length > 1 && (
              <ThumbnailCarousel prev={prev} files={allFiles} />
            )}
          </FilePreviewContainer>
          <RightPanelContainer>
            <StyledTitle level={4}>{file?.name}</StyledTitle>
            <TabsContainer>
              <Tabs
                tab="context"
                onTabChange={() => {}}
                style={{
                  border: 0,
                }}
              >
                <Tabs.Pane
                  title="Contextualization"
                  key="context"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  <Contextualization
                    file={file}
                    tagAnnotations={tagAnnotations}
                    gdprAndTextAndObjectAnnotations={
                      gdprAndTextAndObjectAnnotations
                    }
                  />
                </Tabs.Pane>
                <Tabs.Pane
                  title="File details"
                  key="file-detail"
                  style={{ overflow: 'hidden', height: `calc(100% - 45px)` }}
                >
                  {file && (
                    <DataExplorationProvider sdk={sdk}>
                      <QueryClientProvider client={queryClient}>
                        <FileDetailsReview fileObj={file} />
                      </QueryClientProvider>
                    </DataExplorationProvider>
                  )}
                </Tabs.Pane>
              </Tabs>
            </TabsContainer>
          </RightPanelContainer>
        </AnnotationContainer>
      </QueryClientProvider>
    </>
  );
};
export default ImageReview;

const AnnotationContainer = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: auto minmax(500px, 32%);
  grid-template-rows: 100%;
`;

const FilePreviewContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;
type PreviewProps = {
  fullHeight: boolean;
  inFocus: boolean;
};
const PreviewContainer = styled.div<PreviewProps>`
  max-height: ${(props) => (props.fullHeight ? '100%' : 'calc(100% - 120px)')};
  height: ${(props) => (props.fullHeight ? '100%' : 'calc(100% - 120px)')};
  background: grey;
  outline: ${(props) => (props.inFocus ? '3px solid #4A67FB' : 'none')};
`;

const RightPanelContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 17px;
  display: grid;
  grid-template-rows: 36px 1fr;
  grid-template-columns: 100%;
`;

const StyledTitle = styled(Title)`
  color: #4a67fb;
  padding-bottom: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-sizing: content-box;
`;
