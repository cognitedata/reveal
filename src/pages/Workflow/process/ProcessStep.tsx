import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { useDispatch, useSelector, shallowEqual } from 'react-redux';
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

import { GridCellProps, GridTable } from '@cognite/data-exploration';
import { resetEditHistory, selectAllFiles } from 'src/store/uploadedFilesSlice';
import styled from 'styled-components';
import { getAnnotationCountByModelType } from 'src/store/previewSlice';
import { DetectionModelType } from 'src/api/types';
import { FileGridPreview } from '../components/FileGridPreview/FileGridPreview';
import { AnnotationsBadgeProps } from '../types';

const queryClient = new QueryClient();

export default function ProcessStep() {
  const history = useHistory();
  const uploadedFiles = useSelector((state: RootState) =>
    selectAllFiles(state.uploadedFiles)
  );

  const dispatch = useDispatch();
  const [currentView, setCurrentView] = useState<string>('list');

  const tableData: Array<TableDataItem> = uploadedFiles.map((file) => {
    const jobs =
      useSelector(
        (state: RootState) => state.processSlice.jobsByFileId[file.id],
        (prev, next) => {
          const values =
            prev?.map((job, index) => {
              return next?.[index].status === job.status;
            }) || [];
          return values.every((item) => item);
        }
      ) || [];
    let statusTime = 0;

    const gdprCounts = useSelector(
      (state: RootState) =>
        getAnnotationCountByModelType(
          state.previewSlice,
          file.id.toString(),
          DetectionModelType.GDPR
        ),
      shallowEqual
    );

    const tagCounts = useSelector(
      (state: RootState) =>
        getAnnotationCountByModelType(
          state.previewSlice,
          file.id.toString(),
          DetectionModelType.Tag
        ),
      shallowEqual
    );

    const textAndObjectsCounts = useSelector(
      (state: RootState) =>
        getAnnotationCountByModelType(
          state.previewSlice,
          file.id.toString(),
          DetectionModelType.Text
        ),
      shallowEqual
    );
    const annotationsBadgeProps = {
      gdpr: {
        ...gdprCounts,
        status: jobs.find((item) => item.type === DetectionModelType.GDPR)
          ?.status,
      },
      tag: {
        ...tagCounts,
        status: jobs.find((item) => item.type === DetectionModelType.Tag)
          ?.status,
      },
      textAndObjects: {
        ...textAndObjectsCounts,
        status: jobs.find((item) => item.type === DetectionModelType.Text)
          ?.status,
      },
    } as AnnotationsBadgeProps;

    if (jobs.length) {
      statusTime = Math.max(...jobs.map((job) => job.statusTime));
    }

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
      statusTime,
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
