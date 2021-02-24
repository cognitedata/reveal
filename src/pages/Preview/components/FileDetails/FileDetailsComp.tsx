import React from 'react';
import { Title } from '@cognite/cogs.js';
import {
  DataExplorationProvider,
  FileDetails,
} from '@cognite/data-exploration';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const Container = styled.div``;

const TitleRow = styled.div`
  margin-top: 15px;
  margin-bottom: 7px;
`;

const DetailsContainer = styled.div`
  width: 100%;
`;

type FileDetailCompProps = { fileObj?: FileInfo };

export const FileDetailsComp: React.FC<FileDetailCompProps> = ({
  fileObj,
}: FileDetailCompProps) => {
  // todo: remove data-explorer component and make the ui from scratch
  return (
    <Container>
      <TitleRow>
        <Title level={3}>File Details</Title>
      </TitleRow>
      <DetailsContainer>
        <DataExplorationProvider sdk={sdk}>
          <QueryClientProvider client={queryClient}>
            {fileObj && <FileDetails file={fileObj} />}
          </QueryClientProvider>
        </DataExplorationProvider>
      </DetailsContainer>
    </Container>
  );
};
