import React, { useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { retrieve as retrieveFile } from '@cognite/cdf-resources-store/dist/files';
import { useResourcesDispatch } from '@cognite/cdf-resources-store';
import { listByFileId } from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import ResourceSelectionContext from 'context/ResourceSelectionContext';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import queryString from 'query-string';
import { useLocation } from 'react-router';
import { FilePreview } from './FilePreview';

export const FilePage = () => {
  const dispatch = useResourcesDispatch();
  const { fileId } = useParams<{
    fileId: string | undefined;
  }>();
  const { search } = useLocation();
  const history = useHistory();
  const fileIdNumber = fileId ? parseInt(fileId, 10) : undefined;
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
  }, [fileIdNumber]);

  useEffect(() => {
    if (fileIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: fileIdNumber }]));
        await dispatch(listByFileId(fileIdNumber));
      })();
    }
    hidePreview();
  }, [dispatch, fileIdNumber, hidePreview]);

  const { page = 1 }: { page?: number } = queryString.parse(search, {
    parseNumbers: true,
  });

  return (
    <FilePreview
      fileId={fileIdNumber}
      contextualization
      page={page}
      onPageChange={newPage => {
        const currentSearch = queryString.parse(search);
        history.replace({
          search: queryString.stringify({
            ...currentSearch,
            page: newPage,
          }),
        });
      }}
    />
  );
};
