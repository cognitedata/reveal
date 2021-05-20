import React, { useEffect, useState } from 'react';
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
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { useHistory } from 'react-router-dom';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { ResultData } from 'src/modules/Common/types';
import { explorerFileFetchLimit } from 'src/constants/ExplorerConstants';
import { useDispatch } from 'react-redux';
import { setFiles } from 'src/modules/Common/filesSlice';
import { totalFileCount } from 'src/api/file/aggregate';

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
  const [tableData, setTableData] = useState<ResultData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const onReviewClick = (file: FileInfo) => {
    history.push(
      getParamLink(workflowRoutes.review, ':fileId', String(file.id))
    );
  };
  useEffect(() => {
    (async () => {
      const fileSearchResult = await sdkv3.files.search({
        filter: props.filter,
        search: { name: props.query },
        limit: explorerFileFetchLimit,
      });

      dispatch(setFiles(fileSearchResult));

      const populatedData = populateTableData(fileSearchResult, onReviewClick);
      setTableData(populatedData);
    })();

    (async () => {
      totalFileCount(props.filter).then((res) => {
        setTotalCount(res);
      });
    })();
  }, [props.query, props.filter]);

  return <>{children({ data: tableData, totalCount })}</>;
};

const populateTableData = (
  files: FileInfo[],
  onReviewClick: (file: FileInfo) => void
): ResultData[] => {
  return files.map((file: any) => {
    const menuActions = {
      onReviewClick: () => {
        onReviewClick(file);
      },
    };
    return {
      ...file,
      menu: menuActions,
      mimeType: file.mimeType || '',
      selected: false,
    };
  });
};
