import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { TableProps } from '@data-exploration/components';
import { totalFileCount } from '@vision/api/file/aggregate';
import { fetchFiles } from '@vision/api/file/fetchFiles/fetchFiles';
import { EXPLORER_FILE_FETCH_LIMIT } from '@vision/constants/ExplorerConstants';
import { FileActions } from '@vision/modules/Common/types';
import { selectExplorerSortedFiles } from '@vision/modules/Explorer/store/selectors';
import {
  setExplorerFiles,
  setIsLoading,
  setPercentageScanned,
  setLoadingAnnotations,
  setFocusedFileId,
  showFileMetadata,
} from '@vision/modules/Explorer/store/slice';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { RetrieveAnnotations } from '@vision/store/thunks/Annotation/RetrieveAnnotations';
import { DeleteFilesById } from '@vision/store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from '@vision/store/thunks/Files/FetchFilesById';
import { PopulateReviewFiles } from '@vision/store/thunks/Review/PopulateReviewFiles';
import { getParamLink, workflowRoutes } from '@vision/utils/workflowRoutes';

import {
  SelectableItemsProps,
  TableStateProps,
} from '@cognite/data-exploration';
import {
  FileInfo,
  Asset,
  CogniteEvent,
  Timeseries,
  Sequence,
  FileFilterProps,
} from '@cognite/sdk';

export const ResultTableLoader = ({
  children,
  ...props
}: {
  reFetchProp?: boolean;
  children: (
    tableProps: (FileInfo & { menuActions: any; rowKey: string })[],
    totalCount: number
  ) => ReactElement;
} & {
  filter: FileFilterProps;
  query: string;
  type: string;
} & Partial<SelectableItemsProps> &
  TableStateProps) => {
  const navigate = useNavigate();
  const dispatch = useThunkDispatch();
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
        navigate(
          getParamLink(workflowRoutes.review, ':fileId', String(fileInfo.id))
        );
      },
      onFileDelete: (id: number) => {
        dispatch(DeleteFilesById({ fileIds: [id] }));
      },
    }),
    [dispatch, navigate]
  );

  const tableData = useMemo(
    () =>
      (explorerFiles as FileInfo[]).map((file: FileInfo) => ({
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
      dispatch(RetrieveAnnotations({ fileIds, clearCache: true })); // clearCache: true will clear annotation state before adding new annotations
      // manually clearing annotations is not needed
      dispatch(setExplorerFiles(fileSearchResult));
    })();

    (async () => {
      totalFileCount(props.filter).then((res) => {
        setTotalCount(res);
      });
    })();
  }, [props.query, props.filter, props.reFetchProp]);

  return <>{children(tableData, totalCount)}</>;
};
