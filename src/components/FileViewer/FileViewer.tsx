import * as pdfjs from 'pdfjs-dist';
import { FileInfo as File } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteFileViewer } from '@cognite/react-picture-annotation';
import { AnnotationPopover } from 'components/FileViewer/AnnotationPopover';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { useFileAssetAnnotations } from 'models/cdf/files/queries/useFileAssetAnnotations';
import { readablePreviewableFileTypes } from 'models/cdf/files/utils/readablePreviewableFileTypes';
import { isFilePreviewable } from 'models/cdf/files/utils/isFilePreviewable';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

const defaultTranslations = makeDefaultTranslations(
  'Select a file to preview it',
  'No preview',
  'File types that can be previewed are',
  'Time series',
  'Asset not found'
);

export const FileViewer = ({ file }: { file?: File }) => {
  const sdk = useSDK();
  const { data: assetAnnotations } = useFileAssetAnnotations(file);
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'FileViewer').t,
  };

  if (!file) {
    return (
      <ErrorWrapper>
        <h2>{t['Select a file to preview it']}</h2>
      </ErrorWrapper>
    );
  }

  if (!isFilePreviewable(file)) {
    return (
      <ErrorWrapper>
        <h2>{t['No preview']}</h2>
        <p>
          {`${t['File types that can be previewed are']}:`}
          {readablePreviewableFileTypes()}
        </p>
      </ErrorWrapper>
    );
  }

  return (
    <CogniteFileViewer
      // @ts-ignore
      sdk={sdk}
      file={file}
      annotations={assetAnnotations}
      renderItemPreview={(annotations) => {
        return (
          <AnnotationPopover
            annotations={annotations}
            annotationTitle={t['Time series']}
            fallbackText={t['Asset not found']}
          />
        );
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
