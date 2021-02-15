import React from 'react';

import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { FileTable } from 'src/pages/Workflow/components/FileTable/FileTable';

export default function ProcessStep() {
  const { uploadedFiles } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  return <FileTable data={uploadedFiles} items={uploadedFiles} />;
}
