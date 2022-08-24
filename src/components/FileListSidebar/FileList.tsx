import { Icon, Infobox } from '@cognite/cogs.js';
import { ReactNode } from 'react';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';
import { FileListItem } from './FileListItem';

const defaultTranslations = makeDefaultTranslations(
  'Unable to preview file',
  'No files found',
  'Error when loading files'
);

type Props = {
  files: {
    id: number;
    name: string;
    active: boolean;
    error?: boolean;
    preview: ReactNode;
  }[];
  onFileClick: (fileId: number) => void;
  isLoading?: boolean;
  isError: boolean;
  translations?: typeof defaultTranslations;
};

export const FileList = ({
  files,
  onFileClick,
  isLoading = false,
  isError,
  translations,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Icon type="Loader" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: 16 }}>
        <Infobox type="warning" title={t['Error when loading files']} />
      </div>
    );
  }

  return (
    <ListWrapper>
      {files.length > 0 ? (
        files.map(({ id, name, active, error, preview }) => (
          <FileListItem
            key={id}
            fileName={name}
            isActive={active}
            isError={error}
            preview={preview}
            onFileClick={() => onFileClick(id)}
            errorText={t['Unable to preview file']}
          />
        ))
      ) : (
        <div style={{ padding: 16 }}>
          <Infobox type="default" title={t['No files found']} />
        </div>
      )}
    </ListWrapper>
  );
};

FileList.defaultTranslations = defaultTranslations;
FileList.translationsNamespace = 'FileList';

const ListWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
`;

export const PreviewContainer = styled.div`
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

export const ImagePreview = styled.div`
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
