import React, { useState, useEffect, useContext } from 'react';
import { Body, Graphic, Button } from '@cognite/cogs.js';
import {
  SearchFilterSection,
  FileTable,
  FileUploaderModal,
} from 'components/Common';
import {
  FileInfo as File,
  FilesSearchFilter,
  FileFilterProps,
} from 'cognite-sdk-v3';
import { useSelector, useDispatch } from 'react-redux';
import { searchSelector, search, count, countSelector } from 'modules/files';
import { FileSmallPreview } from 'containers/Files';
import ResourceSelectionContext, {
  useResourceEditable,
} from 'context/ResourceSelectionContext';
import { checkPermission } from 'modules/app';
import { useHistory } from 'react-router';
import { useTenant } from 'hooks/CustomHooks';
import { List, Content, Preview, ActionRow } from './Common';

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
  const inEditMode = useResourceEditable();
  const hasEditPermissions = useSelector(checkPermission)('filesAcl', 'WRITE');

  const history = useHistory();
  const tenant = useTenant();

  const allowEdit = inEditMode && hasEditPermissions;
  const { fileFilter, setFileFilter } = useContext(ResourceSelectionContext);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const { items: files } = useSelector(searchSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );
  const { count: filesCount } = useSelector(countSelector)(
    buildFilesFilterQuery(fileFilter, query)
  );

  const [modalVisible, setModalVisible] = useState(false);

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
      <ActionRow>
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
        <div className="spacer" />
        {allowEdit && (
          <Button onClick={() => setModalVisible(true)} icon="Upload">
            Upload New File
          </Button>
        )}
      </ActionRow>
      <Content>
        <List>
          <Body>
            {query && query.length > 0
              ? `${
                  filesCount === undefined ? 'Loading' : filesCount
                } results for "${query}"`
              : `All ${filesCount === undefined ? '' : filesCount} Results`}
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
      <FileUploaderModal
        visible={modalVisible}
        onFileSelected={file => {
          history.push(`/${tenant}/explore/file/${file.id}`);
        }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};
