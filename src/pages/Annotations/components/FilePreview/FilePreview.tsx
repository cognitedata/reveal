import React from 'react';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';

type FilePreviewProps = { fileObj?: FileInfo };

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileObj,
}: FilePreviewProps) => {
  if (fileObj) {
    return <CogniteFileViewer sdk={sdk} file={fileObj} hideDownload />;
  }
  return null;
};
