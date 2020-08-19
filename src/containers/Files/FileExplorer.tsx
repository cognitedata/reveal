import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { CogniteFileViewer } from 'components/CogniteFileViewer';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import ResourceSelectionContext from 'context/ResourceSelectionContext';

export const FileExplorer = () => {
  const dispatch = useDispatch();
  const { fileId } = useParams<{
    fileId: string | undefined;
  }>();
  const fileIdNumber = fileId ? parseInt(fileId, 10) : undefined;
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileIdNumber && el.type === 'files'
  );

  useEffect(() => {
    if (fileIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: fileIdNumber, type: 'files', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileIdNumber, setResourcesState]);

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
