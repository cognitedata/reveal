import { ChangeEvent, useCallback, useState } from 'react';
import { Input } from '@cognite/cogs.js';
import { Asset, FileInfo } from '@cognite/sdk';
import { ListItem } from 'components/List';
import { useSearch } from 'hooks/useSearch';
import { useTranslation } from 'hooks/useTranslation';
import debounce from 'lodash/debounce';

import { Results, ResultsWrapper } from '../WorkSpaceSidebar/elements';

type WorkSpaceSearchProps = {
  onLoadFile: (fileId: string, fileName: string) => void;
  children?: React.ReactChild | React.ReactChild[];
};

type StateMachine<T> = {
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILED';
  results?: T[];
  lastQuery?: string;
};

const WorkSpaceSearch = ({ onLoadFile, children }: WorkSpaceSearchProps) => {
  const [filesState, setFilesState] = useState<StateMachine<FileInfo>>();
  const [assetsState, setAssetsState] = useState<StateMachine<Asset>>();
  const [query, setQuery] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const { t } = useTranslation('workspace-sidebar');
  const { search } = useSearch();

  const onSearch = useCallback(async (query: string) => {
    if (query && filesState?.lastQuery !== query) {
      setFilesState({ status: 'LOADING' });
      setAssetsState({ status: 'LOADING' });

      const results = await search(query);
      setFilesState({
        status: 'SUCCESS',
        results: results.files,
      });

      setAssetsState({
        status: 'SUCCESS',
        results: results.assets,
      });

      console.log(assetsState);
      setShowResults(true);
    }
  }, []);

  const onSearchDebounce = useCallback(debounce(onSearch, 500), []);

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const { value } = e.currentTarget;
      setQuery(value);
      onSearchDebounce(value);
    },
    [onSearchDebounce]
  );

  const renderResults = () => {
    if (query && !filesState?.results?.length) {
      return (
        <div>
          {t(
            'search_no_results',
            'We could not find this tag in this workspace...'
          )}
        </div>
      );
    }

    if (filesState?.results?.length) {
      return (
        <div>
          <strong>{t('search_results_header', 'Found tags in cdf')}</strong>
          <br />
          <Results>
            {filesState.results.map((file) => (
              <ListItem
                key={file.id}
                title={t('add_file', 'Click to add to workspace')}
                onClick={(e) => {
                  e.preventDefault();
                  setShowResults(false);
                  onLoadFile(file.id.toString(), file.name);
                }}
              >
                {file.name}
              </ListItem>
            ))}
          </Results>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <Input
        placeholder={t('search_placeholder', 'Search for documents / tags')}
        value={query}
        variant="noBorder"
        icon="Search"
        iconPlacement="right"
        fullWidth
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setShowResults(false);
          }
        }}
        onClick={() => setShowResults(true)}
        // onBlur={() => setShowResults(false)}
        onChange={onInputChange}
      />
      {showResults && <ResultsWrapper>{renderResults()}</ResultsWrapper>}
      {children}
    </div>
  );
};

export default WorkSpaceSearch;
