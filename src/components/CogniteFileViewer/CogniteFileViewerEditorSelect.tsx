import React, { useState, useEffect, useRef } from 'react';
import { Select } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from '@cognite/cogs.js';
import { Popover } from 'components/Common';
import { AssetHoverPreview } from 'containers/HoverPreview';
import {
  search as assetSearch,
  searchSelector as searchAssetSelector,
  retrieve as assetRetrieve,
  itemSelector as assetItemSelector,
} from 'modules/assets';
import unionBy from 'lodash/unionBy';
import {
  search as fileSearch,
  searchSelector as searchFileSelector,
  itemSelector as fileItemSelector,
} from 'modules/files';

const buildAssetQuery = (query: string | undefined) => ({
  limit: 10,
  ...(query && query.length > 0 && { search: { query } }),
});
const buildFileQuery = (query: string | undefined) => ({
  limit: 10,
  ...(query && query.length > 0 && { search: { name: query } }),
});

export const CogniteFileViewerEditorSelect = ({
  label,
  assetId,
  fileId,
  setLabel,
  setAssetId,
  setFileId,
}: {
  label?: string;
  assetId?: number;
  fileId?: number;
  setLabel: (label?: string) => void;
  setAssetId: (id?: number) => void;
  setFileId: (id?: number) => void;
}) => {
  const dispatch = useDispatch();

  const selectRef = useRef<Select<string[]> | null>(null);
  const assetsMap = useSelector(assetItemSelector);
  const filesMap = useSelector(fileItemSelector);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { items: searchAssetsResult, fetching: isFetchingAsset } = useSelector(
    searchAssetSelector
  )(buildAssetQuery(query));
  const { items: searchFilesResult, fetching: isFetchingFile } = useSelector(
    searchFileSelector
  )(buildFileQuery(query));
  const currentAsset = assetId ? assetsMap(assetId) : undefined;
  const currentFile = fileId ? filesMap(fileId) : undefined;

  useEffect(() => {
    dispatch(assetSearch(buildAssetQuery(query)));
    dispatch(fileSearch(buildFileQuery(query)));
  }, [query, dispatch]);

  useEffect(() => {
    if (!open && selectRef.current) {
      selectRef.current.blur();
    }
  }, [open]);

  const assetIds = new Set<number>();

  searchAssetsResult.forEach(result => {
    if (result.rootId) {
      assetIds.add(result.rootId);
    }
  });

  if (currentAsset) {
    assetIds.add(currentAsset.rootId);
  }

  const assetSelectItems = unionBy(
    currentAsset ? [currentAsset] : [],
    searchAssetsResult,
    'id'
  );
  const fileSelectItems = unionBy(
    currentFile ? [currentFile] : [],
    searchFilesResult,
    'id'
  );

  useEffect(() => {
    if (!isFetchingAsset && assetIds.size > 0) {
      dispatch(assetRetrieve([...assetIds].map(id => ({ id }))));
    }
  }, [assetIds, isFetchingAsset, dispatch]);

  const value = () => {
    if (assetId) {
      return [`${assetId}-asset`];
    }
    if (fileId) {
      return [`${fileId}-file`];
    }
    if (label && label.length > 0) {
      return [label];
    }
    return [];
  };

  const currentSelection = () => {
    if (assetId) {
      const asset = assetsMap(Number(assetId));
      if (asset) {
        return (
          <Select.OptGroup label="Selected Asset" key="selected-asset">
            <Select.Option
              key={asset.id}
              value={`${asset.id}-asset`}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon type="DataStudio" />
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {asset.name}
              </span>
            </Select.Option>
          </Select.OptGroup>
        );
      }
    }
    if (fileId) {
      const file = filesMap(Number(fileId));
      if (file) {
        return (
          <Select.OptGroup label="Selected File" key="selected-file">
            <Select.Option
              key={file.id}
              value={`${file.id}-file`}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon type="Document" />
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </span>
            </Select.Option>
          </Select.OptGroup>
        );
      }
    }
    return null;
  };

  return (
    <Select
      ref={selectRef}
      showSearch
      style={{ width: '100%' }}
      placeholder="Search for an asset or create a label"
      value={value()}
      open={open}
      loading={isFetchingAsset || isFetchingFile}
      mode="tags"
      onSelect={(val: string | undefined) => {
        if (val) {
          const [id, type] = val.split('-');
          if (Number.isNaN(Number(id))) {
            setLabel(val);
            setAssetId(undefined);
            setFileId(undefined);
          } else if (type === 'asset') {
            const asset = assetsMap(Number(id));
            setLabel(asset ? asset.name : id);
            if (asset) {
              setFileId(undefined);
              setAssetId(asset.id);
            }
          } else if (type === 'file') {
            const file = filesMap(Number(id));
            setLabel(file ? file.name : id);
            if (file) {
              setAssetId(undefined);
              setFileId(file.id);
            }
          }
        }
        setOpen(false);
      }}
      onChange={(id: string[]) => {
        if (id.length === 0) {
          setLabel(undefined);
          setAssetId(undefined);
          setFileId(undefined);
          setOpen(false);
        }
      }}
      onSearch={setQuery}
      filterOption={false}
      onBlur={() => {
        setOpen(false);
      }}
      onFocus={() => {
        setOpen(true);
      }}
      allowClear
    >
      {currentSelection()}
      {assetSelectItems.length !== 0 && (
        <Select.OptGroup label="Assets" key="assets">
          {assetSelectItems.map(asset => (
            <Select.Option
              key={asset.id}
              value={`${asset.id}-asset`}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Popover
                style={{ marginRight: '6px', display: 'flex' }}
                content={<AssetHoverPreview asset={asset} />}
                placement="leftTop"
              >
                <Icon type="DataStudio" />
              </Popover>
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {asset.name}
              </span>
            </Select.Option>
          ))}
        </Select.OptGroup>
      )}
      {fileSelectItems.length !== 0 && (
        <Select.OptGroup label="Files" key="files">
          {fileSelectItems.map(file => (
            <Select.Option
              key={file.id}
              value={`${file.id}-file`}
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Icon type="Document" />
              <span
                style={{
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </span>
            </Select.Option>
          ))}
        </Select.OptGroup>
      )}
    </Select>
  );
};
