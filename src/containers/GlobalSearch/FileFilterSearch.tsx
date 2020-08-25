import React, { useState, useEffect, useContext } from 'react';
import { Body, Graphic } from '@cognite/cogs.js';
import { SearchFilterSection, FileTable } from 'components/Common';
import {
  FileInfo as File,
  FilesSearchFilter,
  FileFilterProps,
} from 'cognite-sdk-v3';
import { useSelector, useDispatch } from 'react-redux';
import { searchSelector, search, count, countSelector } from 'modules/files';
import { FileSmallPreview } from 'containers/Files';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { List, Content, Preview } from './Common';

// const FilesFilterMapping: { [key: string]: string } = {};

const buildFilesFilterQuery = (
  filter: FileFilterProps,
  query: string | undefined
): FilesSearchFilter => {
  // const reverseLookup: { [key: string]: string } = Object.keys(
  //   FilesFilterMapping
  // ).reduce((prev, key) => ({ ...prev, [FilesFilterMapping[key]]: key }), {});
  return {
    ...(query &&
      query.length > 0 && {
        search: {
          name: query,
        },
      }),
    filter,
  };
};

export const FileFilterSearch = ({ query = '' }: { query?: string }) => {
  const dispatch = useDispatch();
  const { fileFilter, setFileFilter } = useContext(ResourceSelectionContext);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const { items: files } = useSelector(searchSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );
  const { count: filesCount } = useSelector(countSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );

  useEffect(() => {
    dispatch(search(buildFilesFilterQuery(fileFilter, query)));
    dispatch(count(buildFilesFilterQuery(fileFilter, query)));
  }, [dispatch, fileFilter, query]);

  const metadataCategories: { [key: string]: string } = {};

  const tmpMetadata = files.reduce((prev, el) => {
    if (!prev.source) {
      prev.source = new Set<string>();
    }
    if (!prev.mimeType) {
      prev.mimeType = new Set<string>();
    }
    if (el.source && el.source.length !== 0) {
      prev.source.add(el.source);
    }
    if (el.mimeType && el.mimeType.length !== 0) {
      prev.mimeType.add(el.mimeType);
    }
    Object.keys(el.metadata || {}).forEach(key => {
      if (key === 'source') {
        return;
      }
      if (el.metadata![key].length !== 0) {
        if (!metadataCategories[key]) {
          metadataCategories[key] = 'Metadata';
        }
        if (!prev[key]) {
          prev[key] = new Set<string>();
        }
        prev[key].add(el.metadata![key]);
      }
    });
    return prev;
  }, {} as { [key: string]: Set<string> });

  const metadata = Object.keys(tmpMetadata).reduce((prev, key) => {
    prev[key] = [...tmpMetadata[key]];
    return prev;
  }, {} as { [key: string]: string[] });

  const filters: { [key: string]: string } = {
    ...(fileFilter.source && { source: fileFilter.source }),
    ...(fileFilter.mimeType && { mimeType: fileFilter.mimeType }),
    ...fileFilter.metadata,
  };

  return (
    <>
      <SearchFilterSection
        metadata={metadata}
        filters={filters}
        metadataCategory={metadataCategories}
        setFilters={newFilters => {
          const {
            source: newSource,
            mimeType: newMimeType,
            ...newMetadata
          } = newFilters;
          setFileFilter({
            source: newSource,
            mimeType: newMimeType,
            metadata: newMetadata,
          });
        }}
      />
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${filesCount || 'Loading'} results for "${query}"`
              : `All ${filesCount || ''} Results`}
          </Body>
          <FileTable
            files={files}
            onFileClicked={setSelectedFile}
            query={query}
          />
        </List>
        <Preview>
          {selectedFile && <FileSmallPreview fileId={selectedFile.id} />}
          {!selectedFile && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <Graphic type="Search" />
              <p>Click on an file to preview here</p>
            </div>
          )}
        </Preview>
      </Content>
    </>
  );
};
