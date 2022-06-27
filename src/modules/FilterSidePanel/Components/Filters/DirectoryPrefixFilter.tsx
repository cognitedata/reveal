import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { RightOutlined } from '@ant-design/icons';
import { Body, Button, Detail } from '@cognite/cogs.js';
import { StringFilter } from '@cognite/data-exploration';
import {
  VisionFileFilterProps,
  VisionFilterItemProps,
} from 'src/modules/FilterSidePanel/types';

const extractSubDirectories = (subdirectoryPaths: string[]) => {
  const subDirectories = subdirectoryPaths
    .filter((subdirectoryPath) => subdirectoryPath.startsWith('/'))
    .map((path) => path.split('/')[1])
    .filter((v, i, a) => a.indexOf(v) === i && v !== '');
  return subDirectories;
};

const getSubdirectoryList = (
  availableDirectories: string[],
  filter: VisionFileFilterProps
) => {
  const currentDirectory = filter.directoryPrefix ?? '';
  let subdirectoryList = [];
  let subdirectoryPaths: string[] = [];
  let exactMatch = true;

  subdirectoryPaths = availableDirectories
    .filter((path: string) => path.startsWith(currentDirectory))
    .map(
      (path: string) => path.replace(`${currentDirectory}`, '') // remove current directory path
    );

  subdirectoryList = extractSubDirectories(subdirectoryPaths);

  // if currentDirectory don't has exact matching directory
  if (subdirectoryList.length === 0) {
    exactMatch = false;
    const parent = currentDirectory.substring(
      0,
      currentDirectory.lastIndexOf('/')
    );
    subdirectoryPaths = availableDirectories
      .filter((path: string) => path.startsWith(currentDirectory))
      .map(
        (path: string) => path.replace(`${parent}`, '') // remove current directory path
      );
    subdirectoryList = extractSubDirectories(subdirectoryPaths);
  }

  const subdirectories = subdirectoryList.map((directory) => {
    // for each sub directory item
    const chi = subdirectoryPaths
      .filter((path) => path.split('/')[1] === directory) // get relavent paths for sub directory item
      .map((path: string) => path.replace(`/${directory}`, '')) // remove sub directory path and get child
      .filter((v, i, a) => a.indexOf(v) === i && v !== ''); // remove duplicates and empty strings
    return {
      directory,
      isParentDirectory: chi.length !== 0,
    };
  });
  return { subdirectories, exactMatch };
};

const addDirectoryPrefix = (
  parentSelected: boolean,
  haveExactMatch: boolean,
  directory: string,
  isParentDirectory: boolean,
  filter: VisionFileFilterProps,
  setDirectoryPrefix: (prefix: string | undefined) => void,
  setParentSelected: (selected: boolean) => void
) => {
  const currentPath = filter.directoryPrefix || '';
  // replace directory
  if (!parentSelected || !haveExactMatch) {
    const parent = currentPath.substring(0, currentPath.lastIndexOf('/'));
    setDirectoryPrefix(`${parent}/${directory}`);
  }
  // append directory
  else {
    setDirectoryPrefix(`${currentPath}/${directory}`);
  }
  setParentSelected(isParentDirectory);
};

export const DirectoryPrefixFilter = ({
  availablePrefixes,
  filter,
  setFilter,
}: { availablePrefixes: string[] } & VisionFilterItemProps) => {
  const currentDirectory = filter.directoryPrefix ?? '/';
  const [subDirectoryList, setSubDirectoryList] = useState<
    { directory: string; isParentDirectory: boolean }[]
  >([]);
  const [haveExactMatch, setHaveExactMatch] = useState<boolean>(false);
  const [parentSelected, setParentSelected] = useState<boolean>(true);

  const selectedDirectory = currentDirectory.substring(
    currentDirectory.lastIndexOf('/') + 1,
    currentDirectory.length
  );

  const setDirectoryPrefix = (prefix: string | undefined) => {
    setFilter({
      ...filter,
      directoryPrefix: prefix === '' ? undefined : prefix,
    });
  };

  useEffect(() => {
    // reset when Clear
    if (filter.directoryPrefix === undefined) {
      setParentSelected(true);
    }

    const { subdirectories, exactMatch } = getSubdirectoryList(
      availablePrefixes,
      filter
    );
    setHaveExactMatch(exactMatch);
    if (parentSelected) {
      setSubDirectoryList(subdirectories);
    }
  }, [availablePrefixes, filter]);

  return (
    <>
      <StringFilterContainer>
        <StringFilter
          title="Prefix"
          placeholder="Write or select prefixes"
          value={currentDirectory}
          setValue={(newPrefix) => {
            setParentSelected(true);
            setDirectoryPrefix(newPrefix);
          }}
        />
      </StringFilterContainer>
      <BackButton
        icon="ChevronLeftSmall"
        onClick={() => {
          setParentSelected(true);
          setDirectoryPrefix(
            currentDirectory.substring(0, currentDirectory.lastIndexOf('/'))
          );
        }}
        size="small"
        type="secondary"
        aria-label="back-button"
      />
      <OptionList>
        {subDirectoryList.map((dir) => {
          return (
            <PrefixesOption
              key={dir.directory}
              {...dir}
              isSelected={
                !parentSelected && selectedDirectory === dir.directory
              }
              updateDirectoryPrefix={(
                directory: string,
                isParentDirectory: boolean
              ) =>
                addDirectoryPrefix(
                  parentSelected,
                  haveExactMatch,
                  directory,
                  isParentDirectory,
                  filter,
                  setDirectoryPrefix,
                  setParentSelected
                )
              }
            />
          );
        })}
      </OptionList>
      <Footer>
        <Body level={3}>
          <i>Not showing all directories that are in the tenant.</i>
        </Body>
        <Body level={3}>
          <i>
            Apply more filters and/or add directory prefix to narrow your
            search.
          </i>
        </Body>
      </Footer>
    </>
  );
};

const PrefixesOption = ({
  directory,
  isParentDirectory,
  isSelected,
  updateDirectoryPrefix,
}: {
  directory: string;
  isParentDirectory: boolean;
  isSelected: boolean;
  updateDirectoryPrefix: (
    directory: string,
    isParentDirectory: boolean
  ) => void;
}) => {
  return (
    <OptionListItem
      onClick={() => {
        updateDirectoryPrefix(directory, isParentDirectory);
      }}
    >
      <OptionListItemContent isSelected={isSelected}>
        <StyledDetail>{directory}</StyledDetail>
        {isParentDirectory && (
          <RightOutlined
            style={{ color: '#595959', fontSize: '6px', fontWeight: 'bold' }}
            size={1}
          />
        )}
      </OptionListItemContent>
    </OptionListItem>
  );
};

const StringFilterContainer = styled.div`
  margin-bottom: 10px;
`;

const BackButton = styled(Button)`
  margin-bottom: 10px;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  height: 154px;
  overflow: auto;
  background: #ffffff;
  border: 2px solid #d9d9d9;
  box-sizing: border-box;
  border-radius: 5px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 22px 10px 0px 10px;
`;

const OptionListItem = styled.div`
  padding: 5px 0px 0px 10px;
  cursor: pointer;
`;
const StyledDetail = styled(Detail)``;

const OptionListItemContent = styled.div<{ isSelected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #d9d9d9;
  border-bottom: ${(props) =>
    props.isSelected ? '1px solid #4a67Fb' : '1px solid #d9d9d9'};
  padding: 0px 10px 5px 0px;
  ${StyledDetail} {
    color: ${(props) => (props.isSelected ? '#4a67Fb' : ' #595959')};
  }
`;
