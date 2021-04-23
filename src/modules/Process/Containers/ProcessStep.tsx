import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  FileActions,
  TableDataItem,
} from 'src/modules/Common/Components/FileTable/FileTable';

import { FileToolbar } from 'src/modules/Workflow/components/FileToolbar';
import { Title } from '@cognite/cogs.js';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import {
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/modules/Process/processSlice';

import { GridCellProps, GridTable } from '@cognite/data-exploration';
import { selectAllFiles } from 'src/modules/Upload/uploadedFilesSlice';
import styled from 'styled-components';
import { resetEditHistory } from 'src/modules/FileMetaData/fileMetadataSlice';
import { MapView } from '../../Common/Components/MapView/MapView';
import { FileGridPreview } from '../../Common/Components/FileGridPreview/FileGridPreview';

const queryClient = new QueryClient();

export default function ProcessStep() {
  const history = useHistory();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );

  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState<string>('list');

  const tableData: Array<TableDataItem> = uploadedFiles.map((file) => {
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
      id: file.id,
      name: file.name,
      mimeType: file.mimeType || '',
      menu: menuActions,
    };
  });
  /* eslint-disable react/prop-types */
  const renderGridCell = (props: GridCellProps<TableDataItem>) => {
    return <FileGridPreview item={props.item} style={props.style} />;
  };

  const renderView = () => {
    if (currentView === 'grid') {
      return (
        <GridTable
          data={tableData}
          renderCell={renderGridCell}
          minCellWidth={350}
        />
      );
    }
    if (currentView === 'map') {
      return <MapView data={tableData} />;
    }
    return <FileTable data={tableData} />;
  };
  console.log('Re-rendering process page');
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process and detect annotations</Title>
        <FileToolbar currentView={currentView} onViewChange={setCurrentView} />
        <Container>{renderView()}</Container>
      </QueryClientProvider>
    </>
  );
}

const Container = styled.div`
  flex: 1;
`;
