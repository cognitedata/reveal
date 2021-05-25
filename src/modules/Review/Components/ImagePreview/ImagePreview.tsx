import React, { useMemo } from 'react';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  ViewerEditCallbacks,
} from '@cognite/react-picture-annotation';
import { FileInfo, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  VisibleAnnotations,
  VisionAnnotationState,
} from 'src/modules/Review/previewSlice';
import { AnnotationStyle, AnnotationUtils } from 'src/utils/AnnotationUtils';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

const LoaderContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type FilePreviewProps = {
  fileObj: FileInfo;
  annotations: VisibleAnnotations[];
  editable: boolean;
  creatable: boolean;
  onCreateAnnotation: (annotation: any) => void;
  onUpdateAnnotation: (annotation: any) => void;
};

export type StyledVisionAnnotation = Required<VisionAnnotationState> & {
  mark: AnnotationStyle;
};

const LoaderView = () => {
  return (
    <LoaderContainer>
      <Icon type="Loading" />
    </LoaderContainer>
  );
};

export const ImagePreview: React.FC<FilePreviewProps> = ({
  annotations,
  fileObj,
  editable,
  creatable,
  onCreateAnnotation,
  onUpdateAnnotation,
}: FilePreviewProps) => {
  const callbacks: ViewerEditCallbacks = useMemo(
    () => ({
      onCreate: (ann) => {
        onCreateAnnotation(ann);
        return false;
      },
      onUpdate: (ann) => {
        onUpdateAnnotation(ann);
        return false;
      },
    }),
    [onCreateAnnotation, onUpdateAnnotation]
  );

  const styledAnnotations: ProposedCogniteAnnotation[] = annotations.map(
    (item) => ({
      ...item,
      id: item.id.toString(),
      mark: AnnotationUtils.getAnnotationStyle(item.color, item.status),
      version: 1,
    })
  );

  return (
    <CogniteFileViewer
      sdk={sdk}
      file={fileObj}
      disableAutoFetch
      hideDownload
      hideSearch
      creatable={creatable}
      editable={editable}
      editCallbacks={callbacks}
      annotations={styledAnnotations}
      allowCustomAnnotations
      loader={<LoaderView />}
    />
  );
};
