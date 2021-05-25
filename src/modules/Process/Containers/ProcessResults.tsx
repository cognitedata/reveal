import {
  FileActions,
  ResultData,
  TableDataItem,
  ViewMode,
} from 'src/modules/Common/types';
import {
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/modules/Process/processSlice';
import {
  selectAllFiles,
  setFileSelectState,
} from 'src/modules/Common/filesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { GridCellProps, GridTable } from '@cognite/data-exploration';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import React, { useMemo } from 'react';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { FileTable } from 'src/modules/Common/Components/FileTable/FileTable';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { useHistory } from 'react-router-dom';

export const ProcessResults = ({ currentView }: { currentView: ViewMode }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const selectedId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );

  const processFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const data: ResultData[] = useMemo(() => {
    return processFiles.map((file) => {
      const menuActions: FileActions = {
        showMetadataPreview: (fileId: number) => {
          dispatch(setSelectedFileId(fileId));
          dispatch(resetEditHistory());
          dispatch(showFileMetadataPreview());
        },
        onReviewClick: (fileId: number) => {
          history.push(
            getParamLink(workflowRoutes.review, ':fileId', String(fileId))
          );
        },
      };

      return {
        ...file,
        menu: menuActions,
        mimeType: file.mimeType || '',
        selected: file.selected,
      };
    });
  }, [processFiles]);

  const handleItemClick = (item: TableDataItem) => {
    dispatch(setSelectedFileId(item.id));
    dispatch(showFileMetadataPreview());
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setFileSelectState(item.id, selected));
  };

  const renderView = () => {
    if (currentView === 'grid') {
      return (
        <GridTable
          data={data}
          renderCell={renderGridCell}
          minCellWidth={350}
          onItemClicked={handleItemClick}
        />
      );
    }
    if (currentView === 'map') {
      return <MapView data={data} />;
    }

    return (
      <FileTable
        data={data}
        onRowSelect={handleRowSelect}
        onRowClick={handleItemClick}
        selectedFileId={selectedId}
        totalCount={data.length}
      />
    );
  };
  return <>{renderView()}</>;
};

const renderGridCell = (props: GridCellProps<TableDataItem>) => {
  return <FileGridPreview item={props.item} style={props.style} />;
};
