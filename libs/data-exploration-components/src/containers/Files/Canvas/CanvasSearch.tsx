import React, { useState, useEffect, useCallback } from 'react';

import styled from 'styled-components';

import { PagedFileReference } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import debounce from 'lodash/debounce';

import { Button, Icon, Input, Menu } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { isSupportedFileInfo } from '@cognite/unified-file-viewer';

import { useIsDocumentsApiEnabled } from '../../../hooks';

type CanvasSearchProps = {
  onItemClick: (file: PagedFileReference) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

// NOTE: This component is entirely temporary - will be replaced with the "real" search component
// when it's done. This is just done to showcase some potential features and be able to test
// user flows
const CanvasSearch: React.FC<CanvasSearchProps> = ({ onItemClick }) => {
  const sdk = useSDK();
  const [value, setValue] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const isDocumentsApiEnabled = useIsDocumentsApiEnabled();

  // like above but using debounce
  const debouncedSearchFiles = useCallback(
    debounce(async (searchValue: string) => {
      const results = await sdk.files.search({ search: { name: searchValue } });

      // TODO: Filtering in a hacky way to not fire 10 different requests
      setFiles(
        results.filter((file) =>
          isSupportedFileInfo(file, isDocumentsApiEnabled)
        )
      );
    }, SEARCH_DEBOUNCE_MS),
    [sdk]
  );

  useEffect(() => {
    if (value !== '') {
      debouncedSearchFiles(value);
    }
  }, [value]);

  const onChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const onButtonPress = () => {
    if (value) {
      setValue('');
      return;
    }

    setIsExpanded(false);
  };

  return (
    <Container>
      <SearchbarContainer>
        <StyledSearchbar
          value={value}
          icon="Search"
          placeholder="Search for files to add..."
          onChange={onChangeText}
          fullWidth
          containerStyle={{
            backgroundColor: 'gray',
          }}
        />
        {isExpanded && (
          <ButtonContainer>
            <StyledButton onClick={onButtonPress}>
              {value === '' ? 'Close' : 'Clear'}
            </StyledButton>
          </ButtonContainer>
        )}
      </SearchbarContainer>
      {files.length > 0 && isExpanded && (
        <FileList>
          <Menu>
            {files.map((file) => (
              <Menu.Item
                key={file.id}
                onClick={() => {
                  onItemClick({ id: file.id, page: 1 });
                  setValue('');
                  setIsExpanded(false);
                }}
              >
                <FileListItem>
                  <StyledIcon type="Document" />
                  <FileName>{file.name}</FileName>
                </FileListItem>
              </Menu.Item>
            ))}
          </Menu>
        </FileList>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  position: absolute;
  width: 400px;

  top: 16px;
  left: 16px;

  background: white;
  border-radius: 4px;
  border: 1px solid gray;
  overflow: hidden;
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 400px;
  width: 100%;
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(Button)`
  background: white;
  &:hover {
    background: white;
  }
`;

const SearchbarContainer = styled.div`
  width: 100%;
  position: relative;
`;

const FileListItem = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledIcon = styled(Icon)`
  margin-right: 10px;
  width: 32px;
`;

const FileName = styled.div`
  text-overflow: ellipsis;
`;

const StyledSearchbar = styled(Input)`
  height: 50px;
  width: 100%;
  border-radius: 4px;
  .cogs-input {
    border: none;
    &:focus {
      outline: none;
      border: none;
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
  .cogs-input.with-icon-left {
    padding-left: 43px;
  }
  .cogs-input:hover {
    border: none;
  }
`;

export default CanvasSearch;
