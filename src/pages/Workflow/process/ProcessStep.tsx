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
import { DetectionModelType } from 'src/api/types';
import {
  getParamLink,
  workflowRoutes,
} from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import {
  detectAnnotations,
  setSelectedDetectionModels,
  setSelectedFileId,
  showFileMetadataPreview,
} from 'src/store/processSlice';
import { getFileJobsStatus } from 'src/pages/Workflow/components/FileTable/getFileJobsResultingStatus';
import { GridTable, GridCellProps } from '@cognite/data-exploration';
import { resetEditHistory, selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';
import { message } from 'antd';
import { FileGridPreview } from '../components/FileGridPreview/FileGridPreview';

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

  const onDetectClick = () => {
    if (!selectedDetectionModels.length) {
      message.error('Please select ML models to use for detection');
      return;
    }
    dispatch(
      detectAnnotations({
        fileIds: uploadedFiles.map(({ id }) => id),
        detectionModels: selectedDetectionModels,
      })
    );
  };

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
          onDetectClick={onDetectClick}
        />
        <Container>
          {currentView === 'grid' ? (
            <GridTable
              data={tableData}
              selectionMode="multiple"
              renderCell={(cellProps: GridCellProps<TableDataItem>) => (
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
