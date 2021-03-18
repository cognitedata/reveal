import React, { useState } from 'react';
import { Body, Icon, Title } from '@cognite/cogs.js';
import { FileInfo as File } from '@cognite/sdk';
import { FileViewer } from 'components/FileViewer';
import { FileList } from 'components/FileList';
import { useAssets } from 'hooks/api';
import { useParams } from 'react-router-dom';
import styled from 'styled-components/macro';

export const FileView = () => {
  const { assetId } = useParams<{ assetId: string }>();

  const [selectedFile, setSelectedFile] = useState<File>();

  const { data: assets = [], isFetched } = useAssets([{ id: Number(assetId) }]);

  if (!isFetched) {
    return <Icon type="Loading" />;
  }

  if (assets.length === 0) {
    return <>Asset does not exist!</>;
  }

  return (
    <FileViewContainer>
      <FileSidebar>
        <Header>
          <Title level={4}>{assets[0].name}</Title>
          <Body level={2}>{assets[0].description}</Body>
        </Header>
        <FileList
          assetId={assetId}
          selectedFileId={selectedFile?.id}
          onFileClick={(file: File) => setSelectedFile(file)}
        />
      </FileSidebar>
      <FileViewerContainer>
        <FileViewer file={selectedFile} />
      </FileViewerContainer>
    </FileViewContainer>
  );
};

const FileViewContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const FileSidebar = styled.div`
  width: 25%;
  height: 100%;
  border-right: 1px solid var(--cogs-greyscale-grey3);
  margin-right: 10px;
`;

const FileViewerContainer = styled.div`
  width: 75%;
  height: 100%;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;
