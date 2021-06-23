import React, { useEffect, useMemo, useState } from 'react';
import {
  SelectableItemsProps,
  TableStateProps,
  SearchResultLoaderProps,
  RelatedResourcesLoaderProps,
  TableProps,
} from '@cognite/data-exploration';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
} from '@cognite/sdk';
import { useHistory } from 'react-router-dom';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { FileActions } from 'src/modules/Common/types';
import { EXPLORER_FILE_FETCH_LIMIT } from 'src/constants/ExplorerConstants';
import { totalFileCount } from 'src/api/file/aggregate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { fetchFilesById } from 'src/store/thunks/fetchFilesById';
import { addFileInfo } from 'src/modules/Common/filesSlice';
import {
  selectExplorerAllFiles,
  setExplorerFiles,
  setExplorerSelectedFileId,
  showExplorerFileMetadata,
} from '../store/explorerSlice';
import { searchFilesWithValidMimeTypes } from '../../../api/file/searchFilesWithValidMimeTypes';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const ResultTableLoader = <T extends Resource>({
  children,
  ...props
}: {
  children: (tableProps: TableProps<T>) => React.ReactNode;
} & Partial<SearchResultLoaderProps> &
  Partial<RelatedResourcesLoaderProps> &
  Partial<SelectableItemsProps> &
  TableStateProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [totalCount, setTotalCount] = useState<number>(0);

  const explorerFiles = useSelector(({ explorerReducer }: RootState) =>
    selectExplorerAllFiles(explorerReducer)
  );

  const menuActions: FileActions = {
    // TODO: should onDelete be added here as well?
    onFileDetailsClicked: (fileInfo: FileInfo) => {
      dispatch(addFileInfo(fileInfo as FileInfo));
      dispatch(setExplorerSelectedFileId(fileInfo.id));
      dispatch(showExplorerFileMetadata());
    },
    onReviewClick: (fileInfo: FileInfo) => {
      dispatch(fetchFilesById([{ id: fileInfo.id }]));
      history.push(
        getParamLink(workflowRoutes.review, ':fileId', String(fileInfo.id)),
        { from: 'explorer' }
      );
    },
  };

  const tableData = useMemo(
    () =>
      explorerFiles.map((file) => ({
        ...file,
        menuActions,
        mimeType: file.mimeType || '',
      })),
    [explorerFiles, menuActions]
  );

  useEffect(() => {
    (async () => {
      const fileSearchResult = await searchFilesWithValidMimeTypes(
        props.filter,
        { name: props.query },
        EXPLORER_FILE_FETCH_LIMIT
      );
      dispatch(setExplorerFiles(fileSearchResult));
    })();

    (async () => {
      totalFileCount(props.filter).then((res) => {
        setTotalCount(res);
      });
    })();
  }, [props.query, props.filter]);

  return <>{children({ data: tableData, totalCount })}</>;
};
