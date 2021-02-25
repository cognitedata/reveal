import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  MenuActions,
  TableDataItem,
} from 'src/pages/Workflow/components/FileTable/FileTable';
import { Detail, Title } from '@cognite/cogs.js';
import { Annotation, DetectionModelType } from 'src/api/types';
import {
  getParamLink,
  workflowRoutes,
} from 'src/pages/Workflow/workflowRoutes';
import { useHistory } from 'react-router-dom';
import { setSelectedDetectionModels } from 'src/store/processSlice';
import { DetectionModelSelect } from 'src/pages/Workflow/process/DetectionModelSelect';

export default function ProcessStep() {
  const history = useHistory();
  const { uploadedFiles } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  const { jobByFileId, selectedDetectionModels } = useSelector(
    (state: RootState) => state.processSlice
  );

  const dispatch = useDispatch();

  const tableData: Array<TableDataItem> = uploadedFiles.map((file) => {
    const job = jobByFileId[file.id] || {
      status: '',
      items: [],
      statusTime: 0,
    };

    // for now API always return single item, because it doesn't support multiple files upload,
    // but response already have items like if you could upload multiple files
    let annotations: Annotation[] = [];
    if ('items' in job && job.items[0]) {
      annotations = job.items[0].annotations;
    }

    const menuActions: MenuActions = { annotationsAvailable: false };
    if (job.status === 'COMPLETED') {
      menuActions.annotationsAvailable = !!annotations.length;
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
      status: job.status,
      statusTime: job.statusTime,
      annotations,
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
