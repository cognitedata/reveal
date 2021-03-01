import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  MenuActions,
  TableDataItem,
} from 'src/pages/Workflow/components/FileTable/FileTable';
import { Detail, Title } from '@cognite/cogs.js';
import { DetectionModelType, JobStatus } from 'src/api/types';
import {
  getParamLink,
  workflowRoutes,
} from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import { setSelectedDetectionModels } from 'src/store/processSlice';
import { DetectionModelSelect } from 'src/pages/Workflow/process/DetectionModelSelect';
import { getFileJobsResultingStatus } from 'src/pages/Workflow/components/FileTable/getFileJobsResultingStatus';

export default function ProcessStep() {
  const history = useHistory();
  const { uploadedFiles } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  const { jobsByFileId, selectedDetectionModels } = useSelector(
    (state: RootState) => state.processSlice
  );

  const dispatch = useDispatch();

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
      if ('items' in job && job.items[0]) {
        annotationsCount += job.items[0].annotations.length;
      }
    });

    const menuActions: MenuActions = { annotationsAvailable: false };
    if (status === 'Completed') {
      menuActions.annotationsAvailable = annotationsCount > 0;
      menuActions.onAnnotationEditClick = () => {
        history.push(
          getParamLink(workflowRoutes.review, ':fileId', String(file.id))
        );
      };
    }

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
      <Title level={2}>Process and detect annotations</Title>
      <div style={{ maxWidth: 300, marginLeft: 'auto' }}>
        <Detail strong>ML model</Detail>
        <DetectionModelSelect
          value={selectedDetectionModels}
          onChange={(models: Array<DetectionModelType>) =>
            dispatch(setSelectedDetectionModels(models))
          }
        />
      </div>

      <br />
      <FileTable data={tableData} />
    </>
  );
}
