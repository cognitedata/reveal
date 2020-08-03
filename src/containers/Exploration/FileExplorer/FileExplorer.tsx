import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { retrieve as retrieveFile } from 'modules/files';
import { useDispatch } from 'react-redux';
import { ResourceSidebar } from 'containers/ResourceSidebar';
import { CogniteFileViewer } from 'components/CogniteFileViewer';
import { RenderResourceActionsFunction } from 'containers/HoverPreview';
import { listByFileId } from 'modules/annotations';

export const FileExplorer = ({
  renderResourceActions,
  onFileSelected,
  onAssetSelected,
  onSequenceSelected,
}: {
  renderResourceActions: RenderResourceActionsFunction;
  onFileSelected: (id: number) => void;
  onAssetSelected: (id: number) => void;
  onSequenceSelected: (id: number) => void;
}) => {
  const dispatch = useDispatch();
  const { fileId } = useParams<{
    fileId: string | undefined;
  }>();
  const fileIdNumber = fileId ? parseInt(fileId, 10) : undefined;
  useEffect(() => {
    if (fileIdNumber) {
      (async () => {
        await dispatch(retrieveFile([{ id: fileIdNumber }]));
        await dispatch(listByFileId(fileIdNumber));
      })();
    }
  }, [dispatch, fileIdNumber]);
  return (
    <>
      <CogniteFileViewer
        fileId={fileIdNumber}
        onFileClicked={file => onFileSelected(file.id)}
        onAssetClicked={asset => onAssetSelected(asset.id)}
        onSequenceClicked={sequence => onSequenceSelected(sequence.id)}
        renderResourceActions={renderResourceActions}
      />
      <ResourceSidebar extraButtons={renderResourceActions} />
    </>
  );
};
