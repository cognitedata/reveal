import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { FileTable } from 'src/modules/Common/Components/FileTable/FileTable';
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
import { Column, ColumnShape } from 'react-base-table';
import { NameRenderer } from 'src/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { StringRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { StatusRenderer } from 'src/modules/Common/Containers/FileTableRenderers/StatusRenderer';
import { AnnotationRenderer } from 'src/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { ActionRenderer } from 'src/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { FileActions, TableDataItem } from 'src/modules/Common/Types';
import { FileGridPreview } from '../../Common/Components/FileGridPreview/FileGridPreview';
import { MapView } from '../../Common/Components/MapView/MapView';

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
    const columns: ColumnShape<TableDataItem>[] = [
      {
        key: 'name',
        title: 'Name',
        dataKey: 'name',
        width: 0,
        flexGrow: 1, // since table is fixed, at least one col must grow
      },
      {
        key: 'mimeType',
        title: 'Mime Type',
        dataKey: 'mimeType',
        width: 100,
      },
      {
        key: 'status',
        title: 'Status',
        width: 250,
        align: Column.Alignment.CENTER,
      },
      {
        key: 'annotations',
        title: 'Annotations',
        width: 0,
        flexGrow: 1,
        align: Column.Alignment.CENTER,
      },
      {
        key: 'action',
        title: 'File Actions',
        dataKey: 'menu',
        align: Column.Alignment.CENTER,
        width: 200,
      },
    ];

    const rendererMap = {
      name: NameRenderer,
      mimeType: StringRenderer,
      status: StatusRenderer,
      annotations: AnnotationRenderer,
      action: ActionRenderer,
    };
    return (
      <FileTable
        data={tableData}
        columns={columns}
        rendererMap={rendererMap}
        selectable
      />
    );
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
