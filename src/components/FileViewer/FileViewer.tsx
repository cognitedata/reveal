import React from 'react';
import * as pdfjs from 'pdfjs-dist';
import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { AnnotationPopover } from 'components/FileViewer';
import {
  isFilePreviewable,
  readablePreviewableFileTypes,
  useAssetAnnotations,
} from 'components/FileList';
import styled from 'styled-components/macro';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

export const FileViewer = ({ file }: { file?: File }) => {
  const sdk = useSDK();
  const { data: assetAnnotations } = useAssetAnnotations(file);

  if (!file) {
    return (
      <ErrorWrapper>
        <h2>Select a file to preview it</h2>
      </ErrorWrapper>
    );
  }

  if (!isFilePreviewable(file)) {
    return (
      <ErrorWrapper>
        <h2>No preview</h2>
        <p>
          File types that can be previewed are: {readablePreviewableFileTypes()}
        </p>
      </ErrorWrapper>
    );
  }

  return (
    <CogniteFileViewer
      sdk={sdk}
      file={file}
      annotations={assetAnnotations}
      renderItemPreview={(annotations) => {
        return <AnnotationPopover annotations={annotations} />;
      }}
      disableAutoFetch
    />
  );
};

const ErrorWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
