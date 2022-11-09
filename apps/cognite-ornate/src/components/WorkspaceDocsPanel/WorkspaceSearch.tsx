import { ChangeEvent, PropsWithChildren, useCallback, useState } from 'react';
import { Input, SegmentedControl } from '@cognite/cogs.js';
import { Asset, FileInfo } from '@cognite/sdk';
import { ListItem } from 'components/List';
import { useSearch } from 'hooks/useSearch';
import { useTranslation } from 'hooks/useTranslation';
import debounce from 'lodash/debounce';

import { Results, ResultsWrapper } from '../WorkSpaceSidebar/elements';

import { WorkSpaceAssetListItem } from './WorkspaceAssetListItem';

type WorkSpaceSearchProps = PropsWithChildren<{
  onLoadFile: (
    fileReference: { id: number; externalId?: string },
    fileName: string
  ) => void;
}>;

type StateMachine<T> = {
  status: 'IDLE' | 'LOADING' | 'SUCCESS' | 'FAILED';
  results?: T[];
  lastQuery?: string;
};

type Mode = 'asset' | 'file';

const WorkSpaceSearch = ({ onLoadFile, children }: WorkSpaceSearchProps) => {
  const [filesState, setFilesState] = useState<StateMachine<FileInfo>>();
  const [assetsState, setAssetsState] = useState<StateMachine<Asset>>();
  const [query, setQuery] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);
  const { t } = useTranslation('workspace-sidebar');
  const [mode, setMode] = useState<Mode>('asset');
  const { search } = useSearch();

  const onSearch = useCallback(async (query: string) => {
    if (query.length === 0) {
      setShowResults(false);
      return;
    }
    if (query.length > 0 && filesState?.lastQuery !== query) {
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
    if (
      query.length > 0 &&
      !filesState?.results?.length &&
      !assetsState?.results?.length
    ) {
      return (
        <div>
          {t(
            'search_no_results',
            'We could not find this tag in this workspace...'
          )}
        </div>
      );
    }

    if (mode === 'asset' && assetsState?.results?.length) {
      return (
        <div>
          <strong>
            {t('search_results_header_tags', 'Found tags in cdf')}
          </strong>
          <br />
          <Results>
            {(assetsState?.results || []).map((asset) => (
              <WorkSpaceAssetListItem
                key={asset.id}
                asset={asset}
                onClickFile={(file) => {
                  setShowResults(false);
                  onLoadFile(
                    { id: file.id, externalId: file.externalId },
                    file.name
                  );
                }}
              />
            ))}
          </Results>
        </div>
      );
    }

    if (mode === 'file' && filesState?.results?.length) {
      return (
        <div>
          <strong>
            {t('search_results_header_files', 'Found files in cdf')}
          </strong>
          <br />
          <Results>
            {(filesState?.results || []).map((file) => (
              <ListItem
                key={file.id}
                title={t('add_file', 'Click to add to workspace')}
                onClick={(e) => {
                  e.preventDefault();
                  setShowResults(false);
                  onLoadFile(
                    { id: file.id, externalId: file.externalId },
                    file.name
                  );
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
        icon={filesState?.status === 'LOADING' ? 'Loader' : 'Search'}
        iconPlacement="right"
        fullWidth
        onFocus={() => {
          if (query && query.length > 0) {
            setShowResults(true);
          }
        }}
        onKeyUp={(event) => {
          event.stopPropagation();
        }}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowResults(false);
          }
        }}
        onChange={onInputChange}
      />
      {showResults && (
        <ResultsWrapper>
          <SegmentedControl
            currentKey={mode}
            fullWidth
            style={{ marginBottom: 16 }}
            onButtonClicked={(key) => {
              setMode(key as Mode);
            }}
          >
            <SegmentedControl.Button key="asset">
              {t('search_tags', 'Search for Tags')}
            </SegmentedControl.Button>
            <SegmentedControl.Button key="file">
              {t('search_files', 'Search for Files')}
            </SegmentedControl.Button>
          </SegmentedControl>

          {renderResults()}
        </ResultsWrapper>
      )}
      {children}
    </div>
  );
};

export default WorkSpaceSearch;
