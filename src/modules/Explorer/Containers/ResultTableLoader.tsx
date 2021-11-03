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
import { FileActions } from 'src/modules/Common/types';
import { EXPLORER_FILE_FETCH_LIMIT } from 'src/constants/ExplorerConstants';
import { totalFileCount } from 'src/api/file/aggregate';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectExplorerAllFiles,
  setExplorerFiles,
  setExplorerFocusedFileId,
  showExplorerFileMetadata,
  setIsLoading,
  setPercentageScanned,
} from 'src/modules/Explorer/store/explorerSlice';
import { clearExplorerFileState } from 'src/store/commonActions';
import { RootState } from 'src/store/rootReducer';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';
import { fetchFiles } from 'src/api/file/fetchFiles/fetchFiles';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const ResultTableLoader = <T extends Resource>({
  children,
  ...props
}: {
  reFetchProp?: boolean;
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
      dispatch(FetchFilesById([fileInfo.id]));
      dispatch(setExplorerFocusedFileId(fileInfo.id));
      dispatch(showExplorerFileMetadata());
    },
    onReviewClick: (fileInfo: FileInfo) => {
      dispatch(PopulateReviewFiles([fileInfo.id]));
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
        rowKey: `explore-${file.id}`,
      })),
    [explorerFiles, menuActions]
  );

  const handleSetIsLoading = (loading: boolean) => {
    dispatch(setIsLoading(loading));
  };
  const handleSetPercentageScanned = (percentComplete: number) => {
    dispatch(setPercentageScanned(percentComplete));
  };

  useEffect(() => {
    (async () => {
      dispatch(clearExplorerFileState(explorerFiles.map((file) => file.id)));
      const fileSearchResult = await fetchFiles(
        props.filter,
        { name: props.query },
        EXPLORER_FILE_FETCH_LIMIT,
        handleSetIsLoading,
        handleSetPercentageScanned
      );
      dispatch(setExplorerFiles(fileSearchResult));
    })();

    (async () => {
      totalFileCount(props.filter).then((res) => {
        setTotalCount(res);
      });
    })();
  }, [props.query, props.filter, props.reFetchProp]);

  return <>{children({ data: tableData, totalCount })}</>;
};
