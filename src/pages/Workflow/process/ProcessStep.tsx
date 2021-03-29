import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  MenuActions,
  TableDataItem,
} from 'src/pages/Workflow/components/FileTable/FileTable';

import { FileToolbar } from 'src/pages/Workflow/components/FileToolbar';
import { Title } from '@cognite/cogs.js';
import { DetectionModelType, JobStatus } from 'src/api/types';
import {
  getParamLink,
  workflowRoutes,
} from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import {
  setSelectedDetectionModels,
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/store/processSlice';
import { getFileJobsResultingStatus } from 'src/pages/Workflow/components/FileTable/getFileJobsResultingStatus';
import {
  FileGridPreview,
  GridTable,
  GridCellProps,
} from '@cognite/data-exploration';
import { resetEditHistory, selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

const queryClient = new QueryClient();

export default function ProcessStep() {
  const history = useHistory();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );
  const { jobsByFileId, selectedDetectionModels } = useSelector(
    (state: RootState) => state.processSlice
  );

  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState<string>('list');

  const tableData: Array<TableDataItem> = uploadedFiles.map((file) => {
    const jobs = jobsByFileId[file.id] || [];
    let annotationsCount = 0;
    let status: JobStatus | '' = '';
    let statusTime = 0;
    if (jobs.length) {
      status = getFileJobsResultingStatus(jobs);
      statusTime = Math.max(...jobs.map((job) => job.statusTime));
    }

    // for now API always return single item, because it doesn't support multiple files upload,
    // but response already have items like if you could upload multiple files
    jobs.forEach((job) => {
      if ('items' in job && job.items[0].annotations) {
        annotationsCount += job.items[0].annotations.length;
      }
    });

    const menuActions: MenuActions = {
      annotationsAvailable: false,
      showMetadataPreview: (fileId: number) => {
        dispatch(setSelectedFileId(fileId));
        dispatch(resetEditHistory());
        dispatch(showFileMetadataPreview());
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
      status,
      statusTime,
      annotationsCount,
      menu: menuActions,
    };
  });
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Title level={2}>Process and detect annotations</Title>
        <FileToolbar
          value={selectedDetectionModels}
          onChange={(models: Array<DetectionModelType>) =>
            dispatch(setSelectedDetectionModels(models))
          }
          currentView={currentView}
          onViewChange={setCurrentView}
        />
        <Container>
          {currentView === 'grid' ? (
            <GridTable
              data={uploadedFiles}
              onItemClicked={(item: FileInfo) => {
                history.push(
                  getParamLink(
                    workflowRoutes.review,
                    ':fileId',
                    String(item.id)
                  )
                );
              }}
              isSelected={() => {}}
              selectionMode="multiple"
              onSelect={() => {}} // TODO: add to state for batch operations
              renderCell={(cellProps: GridCellProps<FileInfo>) => (
                <FileGridPreview {...cellProps} />
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
