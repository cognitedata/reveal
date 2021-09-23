import { ChangeEvent, useEffect, useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { Asset, FileInfo } from '@cognite/sdk';
import { useAuthContext } from '@cognite/react-container';
import useConfig from 'hooks/useConfig';
import debounce from 'lodash/debounce';

import { Results, WorkSpaceSidebarWrapper } from './elements';

type WorkSpaceSidebarProps = {
  title: string;
  onLoadFile: (fileId: string | number) => void;
};

type StateMachine<T> = {
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILED';
  results?: T[];
  lastQuery?: string;
};

const WorkSpaceSidebar = ({
  title = 'My Workspace',
  onLoadFile,
}: WorkSpaceSidebarProps) => {
  const [filesState, setFilesState] = useState<StateMachine<FileInfo>>();
  const [assetsState, setAssetsState] = useState<StateMachine<Asset>>();
  const [query, setQuery] = useState<string>('');
  const { client } = useAuthContext();
  const config = useConfig(client?.project);

  useEffect(() => {
    // REMOVE ME - I'm just for testing!
    setQuery('GO');
    onSearch('GO');
  }, []);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearchDebounce(e.target.value);
  };

  const onSearch = (query: string) => {
    if (!client) {
      return;
    }

    if (filesState?.lastQuery !== query) {
      setFilesState({ status: 'LOADING' });
      client.files
        .search({
          filter: config.fileFilter,
          search: {
            name: query,
          },
        })
        .then((nextFiles) => {
          setFilesState({
            status: 'SUCCESS',
            results: nextFiles,
          });
        });
    }

    if (assetsState?.lastQuery !== query) {
      setAssetsState({ status: 'LOADING' });
      client.assets
        .search({
          search: {
            name: query,
          },
        })
        .then((nextAssets) => {
          setAssetsState({
            status: 'SUCCESS',
            results: nextAssets,
          });
        });
    }
  };
  const onSearchDebounce = debounce(onSearch, 500);

  const renderResults = () => {
    if (!query) {
      return (
        <Results>
          Use the input field to search within your workspace, or within CDF.
        </Results>
      );
    }

    if (filesState?.results) {
      return (
        <Results>
          {filesState.results.map((file) => (
            <button
              key={file.id}
              onClick={() => onLoadFile(file.id)}
              type="button"
            >
              {file.name}
            </button>
          ))}
        </Results>
      );
    }

    return null;
  };

  return (
    <WorkSpaceSidebarWrapper className="z-8">
      <h2>{title}</h2>
      <Input
        placeholder="Search for documents / tags"
        value={query}
        onChange={onInputChange}
        style={{ width: '100%' }}
      />
      {renderResults()}
    </WorkSpaceSidebarWrapper>
  );
};

export default WorkSpaceSidebar;
