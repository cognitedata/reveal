import { useEffect, useMemo } from 'react';
import { Body, DocumentIcon, Icon, Overline } from '@cognite/cogs.js';
import { Asset, FileInfo as File } from '@cognite/sdk';
import styled from 'styled-components/macro';
import {
  isFilePreviewable,
  useFileIcon,
  useFilesAssetAppearsIn,
} from 'components/FileList';
import DelayedComponent from 'components/DelayedComponent';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';

const FileListItem = ({
  file,
  isActive = false,
  onFileClick,
  errorText = 'Unable to preview file.',
}: {
  file: File;
  isActive: boolean;
  onFileClick: () => void;
  errorText: string;
}) => {
  const { data: imageUrl, isLoading, isError } = useFileIcon(file);

  const image = useMemo(() => {
    if (isFilePreviewable(file)) {
      if (imageUrl) {
        return <img src={imageUrl} alt="" />;
      }
      if (isLoading) {
        return <Icon type="Loader" />;
      }
    }
    return (
      <>
        <DocumentIcon file={file.name} style={{ height: 36, width: 36 }} />
        {isError && <Body level={3}>{errorText}</Body>}
      </>
    );
  }, [imageUrl, file, isError, isLoading, errorText]);

  return (
    <PreviewContainer onClick={() => onFileClick()} isActive={isActive}>
      <Overline level={2}> {file.name}</Overline>
      <ImagePreview>{image}</ImagePreview>
    </PreviewContainer>
  );
};

const defaultTranslations = makeDefaultTranslations(
  'Unable to preview file',
  'No files found'
);

export const FileList = ({
  asset,
  selectedFileId,
  onFileClick,
}: {
  asset: Asset;
  selectedFileId?: number;
  onFileClick: (file: File) => void;
}) => {
  const { data = [], isLoading } = useFilesAssetAppearsIn(asset);
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'FileList').t,
  };
  // Select first file on default
  useEffect(() => {
    if (!selectedFileId && data.length > 0) {
      onFileClick(data[0]);
    }
  }, [selectedFileId, data, onFileClick]);

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (data.length === 0) {
    return <ErrorFeedback>{t['No files found']}</ErrorFeedback>;
  }

  return (
    <ListWrapper>
      {data.map((file: File) => (
        <DelayedComponent delay={200} key={file.id}>
          <FileListItem
            file={file}
            isActive={selectedFileId === file.id}
            onFileClick={() => onFileClick(file)}
            errorText={t['Unable to preview file']}
          />
        </DelayedComponent>
      ))}
    </ListWrapper>
  );
};

const ErrorFeedback = styled.div`
  padding: 20px;
`;

const ListWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const PreviewContainer = styled.div`
  padding: 20px;
  overflow-wrap: break-word;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  cursor: pointer;
  background-color: ${(props: { isActive: boolean }) =>
    props.isActive ? 'var(--cogs-midblue-6)' : 'unset'};

  &:hover {
    background-color: ${(props: { isActive: boolean }) =>
      props.isActive ? 'var(--cogs-midblue-6)' : 'var(--cogs-greyscale-grey1)'};
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  min-height: 200px;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
    max-height: 300px;
  }
`;
