import React from 'react';
import * as pdfjs from 'pdfjs-dist';
import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

export const FileViewer = ({ file }: { file?: File }) => {
  const sdk = useSDK();

  if (!file) {
    return <>Select a file to view it!</>;
  }

  return <CogniteFileViewer sdk={sdk} file={file} />;
};
