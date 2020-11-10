import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { useResourcePreview } from 'lib/context/ResourcePreviewContext';
import { FilePreview } from 'lib/containers/Files/FilePreview';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';

export const FilePage = () => {
  const { id } = useParams<{
    id: string | undefined;
  }>();
  const fileIdNumber = id ? parseInt(id, 10) : undefined;
  const { resourcesState, setResourcesState } = useContext(
    ResourceSelectionContext
  );
  const { hidePreview } = useResourcePreview();
  const isActive = resourcesState.some(
    el => el.state === 'active' && el.id === fileIdNumber && el.type === 'file'
  );

  useEffect(() => {
    if (fileIdNumber && !isActive) {
      setResourcesState(
        resourcesState
          .filter(el => el.state !== 'active')
          .concat([{ id: fileIdNumber, type: 'file', state: 'active' }])
      );
    }
  }, [isActive, resourcesState, fileIdNumber, setResourcesState]);

  useEffect(() => {
    trackUsage('Exploration.File', { fileId: fileIdNumber });
    hidePreview();
  }, [fileIdNumber, hidePreview]);

  if (!id || id.length === 0 || !fileIdNumber || Number.isNaN(fileIdNumber)) {
    return null;
  }

  return (
    <>
      <ResourceTitleRow id={fileIdNumber} type="file" icon="Document" />
      <FilePreview fileId={fileIdNumber} contextualization />;
    </>
  );
};
