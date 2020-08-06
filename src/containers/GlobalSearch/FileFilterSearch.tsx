import React, { useState, useEffect } from 'react';
import { Body, Colors } from '@cognite/cogs.js';
import { SearchFilterSection, ListItem } from 'components/Common';
import {
  FileRequestFilter,
  FileFilterProps,
  FilesMetadata,
} from '@cognite/sdk';
import { useSelector, useDispatch } from 'react-redux';
import { searchSelector, search, count, countSelector } from 'modules/files';
import Highlighter from 'react-highlight-words';
import { FileSmallPreview } from 'containers/Files';
import { List, Content, Preview } from './Common';

const FilesFilterMapping: { [key: string]: string } = {
  mimeType: 'File Type',
};

const buildFilesFilterQuery = (
  filter: {
    [key: string]: string;
  },
  query: string | undefined
): FileRequestFilter => {
  const reverseLookup: { [key: string]: string } = Object.keys(
    FilesFilterMapping
  ).reduce((prev, key) => ({ ...prev, [FilesFilterMapping[key]]: key }), {});
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          name: query,
        },
      }),
    filter: Object.keys(filter).reduce(
      (prev, key) => ({
        ...prev,
        [reverseLookup[key] || key]: filter[key],
      }),
      {}
    ) as FileFilterProps,
  };
};

export const FileFilterSearch = ({
  query,
  activeIds = [],
}: {
  query?: string;
  activeIds?: number[];
}) => {
  const dispatch = useDispatch();

  const [selectedFile, setSelectedFile] = useState<FilesMetadata | undefined>(
    undefined
  );

  const [filesFilter, setFilesFilter] = useState<{
    [key: string]: string;
  }>({ 'File Type': 'application/pdf' });

  const { items: files } = useSelector(searchSelector)(
    buildFilesFilterQuery(filesFilter, query)
  );
  const { count: fileCount } = useSelector(countSelector)(
    buildFilesFilterQuery(filesFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildFilesFilterQuery(filesFilter, query)));
    dispatch(count(buildFilesFilterQuery(filesFilter, query)));
  }, [dispatch, filesFilter, query]);

  return (
    <>
      <SearchFilterSection
        metadata={{ 'File Type': ['application/pdf'] }}
        filters={filesFilter}
        setFilters={setFilesFilter}
        lockedFilters={['File Type']}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${fileCount || 'Loading'} results for "${query}"`
              : `All ${fileCount || ''} Results`}
          </Body>
          {files.map(el => {
            return (
              <ListItem
                key={el.id}
                style={{
                  background: [
                    selectedFile ? selectedFile.id : undefined,
                    ...activeIds,
                  ].some(id => id === el.id)
                    ? Colors['greyscale-grey3'].hex()
                    : 'inherit',
                }}
                title={
                  <Highlighter
                    searchWords={(query || '').split(' ')}
                    textToHighlight={el.name}
                  />
                }
                onClick={() => setSelectedFile(el)}
              />
            );
          })}
        </List>
        <Preview>
          {selectedFile && <FileSmallPreview fileId={selectedFile.id} />}
        </Preview>
      </Content>
    </>
  );
};
