import React from 'react';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { CogniteAnnotation } from 'src/utils/AnnotationUtils';

type FilePreviewProps = {
  fileObj: FileInfo;
  annotations: CogniteAnnotation[];
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileObj,
  annotations,
}: FilePreviewProps) => {
  if (fileObj) {
    return (
      <CogniteFileViewer
        sdk={sdk}
        file={fileObj}
        disableAutoFetch
        hideDownload
        hideSearch
        annotations={annotations}
        allowCustomAnnotations
      />
    );
  }
  return null;
};
