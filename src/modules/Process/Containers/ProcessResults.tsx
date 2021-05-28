import {
  FileActions,
  ResultData,
  TableDataItem,
  ViewMode,
} from 'src/modules/Common/types';
import {
  selectIsPollingComplete,
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/modules/Process/processSlice';
import {
  selectAllFiles,
  setFileSelectState,
} from 'src/modules/Common/filesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import React, { useMemo } from 'react';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { FileTable } from 'src/modules/Common/Components/FileTable/FileTable';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { Prompt, useHistory } from 'react-router-dom';
import { PageBasedGrideView } from 'src/modules/Common/Components/GridView/PageBasedGrideView';

export const ProcessResults = ({ currentView }: { currentView: ViewMode }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const selectedId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const processFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const data: ResultData[] = useMemo(() => {
    return processFiles.map((file) => {
      const menuActions: FileActions = {
        // TODO: should onDelete be added here as well?
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

  const handleItemClick = (
    item: TableDataItem,
    showFileDetailsOnClick: boolean = true
  ) => {
    dispatch(setSelectedFileId(item.id));
    if (showFileDetailsOnClick) {
      dispatch(showFileMetadataPreview());
    }
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setFileSelectState(item.id, selected));
  };

  const promptMessage =
    'Processing files. Are you sure you want to leave or refresh this page? The session state and all unsaved processing data will be lost. Already saved processing data can be accessed from the Image explorer on the front page.';
  window.onbeforeunload = (event: any) => {
    // prompt on reload, if in a session and there are files
    if (
      !window.location.pathname.includes('/vision/workflow') ||
      !processFiles.length
    ) {
      return;
    }
    const e = event || window.event;
    e.returnValue = promptMessage; // NOTE: only some browsers show this message
    // eslint-disable-next-line consistent-return
    return promptMessage;
  };

  const renderView = () => {
    if (currentView === 'grid') {
      return (
        <PageBasedGrideView
          onItemClicked={handleItemClick}
          data={data}
          renderCell={(cellProps: any) => <FileGridPreview {...cellProps} />}
          totalCount={data.length}
        />
      );
    }
    if (currentView === 'map') {
      return (
        <MapView
          data={data}
          onRowSelect={handleRowSelect}
          onRowClick={handleItemClick}
          selectedFileId={selectedId}
          totalCount={data.length}
        />
      );
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
  return (
    <>
      <Prompt
        when={!isPollingFinished}
        message={(location, _) => {
          return location.pathname.includes('vision/workflow/review/') // exclude review page
            ? true
            : promptMessage;
        }}
      />
      {renderView()}
    </>
  );
};
