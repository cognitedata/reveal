import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  FileActions,
  TableDataItem,
} from 'src/pages/Workflow/components/FileTable/FileTable';

import { FileToolbar } from 'src/pages/Workflow/components/FileToolbar';
import { Title } from '@cognite/cogs.js';
import {
  getParamLink,
  workflowRoutes,
} from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import {
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/store/processSlice';
import { getFileJobsStatus } from 'src/pages/Workflow/components/FileTable/getFileJobsResultingStatus';
import { GridTable, GridCellProps } from '@cognite/data-exploration';
import { resetEditHistory, selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';
import { FileGridPreview } from '../components/FileGridPreview/FileGridPreview';

const queryClient = new QueryClient();

export default function ProcessStep() {
  const history = useHistory();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  const jobsByFileId = useSelector(
    (state: RootState) => state.processSlice.jobsByFileId
  );

  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState<string>('list');

  const tableData: Array<TableDataItem> = uploadedFiles.map((file) => {
    const jobs = jobsByFileId[file.id] || [];
    let annotationsCount = 0;
    let statusTime = 0;

    const annotationsBadgeProps = getFileJobsStatus(jobs);
    if (jobs.length) {
      statusTime = Math.max(...jobs.map((job) => job.statusTime));
    }

    // for now API always return single item, because it doesn't support multiple files upload,
    // but response already have items like if you could upload multiple files
    jobs.forEach((job) => {
      if ('items' in job && job.items[0].annotations) {
        annotationsCount += job.items[0].annotations.length;
      }
    });

    const menuActions: FileActions = {
      annotationsAvailable: false,
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
    menuActions.annotationsAvailable = annotationsCount > 0;
    menuActions.onAnnotationEditClick = () => {
      history.push(
        getParamLink(workflowRoutes.review, ':fileId', String(file.id))
      );
    };

    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType || '',
      statusTime,
      annotationsCount,
      menu: menuActions,
      annotationsBadgeProps,
    };
  });

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process and detect annotations</Title>
        <FileToolbar currentView={currentView} onViewChange={setCurrentView} />
        <Container>
          {currentView === 'grid' ? (
            <GridTable
              data={tableData}
              renderCell={(props: GridCellProps<TableDataItem>) => (
                <FileGridPreview item={props.item} style={props.style} />
              )}
            />
          ) : (
            <FileTable data={tableData} />
          )}
        </Container>
      </QueryClientProvider>
    </>
  );
}

const Container = styled.div`
  flex: 1;
`;
