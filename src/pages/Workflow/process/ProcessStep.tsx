import React from 'react';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import {
  FileTable,
  TableDataItem,
} from 'src/pages/Workflow/components/FileTable/FileTable';
import { Title } from '@cognite/cogs.js';
import { Annotation } from 'src/api/annotationJob';

export default function ProcessStep() {
  const { uploadedFiles } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  const { jobByFileId } = useSelector((state: RootState) => state.processSlice);
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

    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType || '',
      status: job.status,
      statusTime: job.statusTime,
      annotations,
    };
  });
  return (
    <>
      <Title level={2}>Process and detect annotations</Title>
      <br />
      <FileTable data={tableData} />
    </>
  );
}
