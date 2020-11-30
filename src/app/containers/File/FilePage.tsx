import React from 'react';
import { useParams } from 'react-router-dom';
import { FilePreview } from './FilePreview';

export const FilePage = () => {
  const { id } = useParams<{
    id: string | undefined;
  }>();
  const fileId = id ? parseInt(id, 10) : undefined;
  const invalidId = !fileId || Number.isNaN(fileId);

  if (invalidId) {
    return null;
  }

  return <FilePreview fileId={fileId!} />;
};
