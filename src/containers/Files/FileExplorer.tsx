import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { CogniteFileViewer } from 'components/CogniteFileViewer';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';

export const FileExplorer = () => {
  const dispatch = useDispatch();
  const { fileId } = useParams<{
    fileId: string | undefined;
  }>();
  const fileIdNumber = fileId ? parseInt(fileId, 10) : undefined;

  useEffect(() => {
    trackUsage('Exploration.File', { fileId: fileIdNumber });
  }, [fileIdNumber]);

  useEffect(() => {
    if (fileIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: fileIdNumber }]));
        await dispatch(listByFileId(fileIdNumber));
      })();
    }
  }, [dispatch, fileIdNumber]);
  return <CogniteFileViewer fileId={fileIdNumber} />;
};
