import React from 'react';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { CogniteAnnotation } from 'src/utils/AnnotationUtils';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';

const LoaderContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type FilePreviewProps = {
  fileObj: FileInfo;
  annotations: CogniteAnnotation[];
};

const LoaderView = () => {
  return (
    <LoaderContainer>
      <Icon type="Loading" />
    </LoaderContainer>
  );
};

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileObj,
  annotations,
}: FilePreviewProps) => {
  return (
    <CogniteFileViewer
      sdk={sdk}
      file={fileObj}
      disableAutoFetch
      hideDownload
      hideSearch
      annotations={annotations}
      allowCustomAnnotations
      loader={<LoaderView />}
    />
  );
};
