import React, { ReactElement, useEffect, useMemo, useState } from 'react';
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
  setExplorerFiles,
  setIsLoading,
  setPercentageScanned,
  setLoadingAnnotations,
  setFocusedFileId,
  showFileMetadata,
} from 'src/modules/Explorer/store/slice';
import { selectExplorerSortedFiles } from 'src/modules/Explorer/store/selectors';
import { RootState } from 'src/store/rootReducer';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import { getParamLink, workflowRoutes } from 'src/utils/workflowRoutes';
import { fetchFiles } from 'src/api/file/fetchFiles/fetchFiles';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';

type Resource = FileInfo | Asset | CogniteEvent | Sequence | Timeseries;

export const ResultTableLoader = <T extends Resource>({
  children,
  ...props
}: {
  reFetchProp?: boolean;
  children: (tableProps: TableProps<T>) => ReactElement;
} & Partial<SearchResultLoaderProps> &
  Partial<RelatedResourcesLoaderProps> &
  Partial<SelectableItemsProps> &
  TableStateProps) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [totalCount, setTotalCount] = useState<number>(0);

  const explorerFiles = useSelector((rootState: RootState) =>
    selectExplorerSortedFiles(rootState)
  );

  const menuActions: FileActions = useMemo(
    () => ({
      onFileDetailsClicked: (fileInfo: FileInfo) => {
        dispatch(FetchFilesById([fileInfo.id]));
        dispatch(setFocusedFileId(fileInfo.id));
        dispatch(showFileMetadata());
      },
      onReviewClick: (fileInfo: FileInfo) => {
        dispatch(PopulateReviewFiles([fileInfo.id]));
        history.push(
          getParamLink(workflowRoutes.review, ':fileId', String(fileInfo.id)),
          { from: 'explorer' }
        );
      },
      onFileDelete: (id: number) => {
        dispatch(DeleteFilesById([id]));
      },
    }),
    [dispatch, history]
  );

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
      const fileSearchResult = await fetchFiles(
        props.filter,
        { name: props.query },
        EXPLORER_FILE_FETCH_LIMIT,
        handleSetIsLoading,
        handleSetPercentageScanned
      );
      const fileIds = fileSearchResult.map((item) => item.id);

      dispatch(setLoadingAnnotations());
      dispatch(RetrieveAnnotationsV1({ fileIds, clearCache: true })); // clearCache: true will clear annotation state before adding new annotations
      // manually clearing annotations is not needed
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
