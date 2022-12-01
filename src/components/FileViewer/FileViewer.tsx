import { useEffect, useState } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import * as pdfjs from 'pdfjs-dist';
import { FileInfo } from '@cognite/sdk';
import ReactUnifiedViewer, {
  ContainerConfig,
  getContainerConfigFromFileInfo,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import {
  isFilePreviewable,
  readablePreviewableFileTypes,
} from 'components/FileList/utils';
import { Loader } from './components/Loader';
import { useUnifiedFileViewerState } from './hooks/useUnifiedFileViewerState';
import {
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
  ROOT_CONTAINER_ID,
} from './constants';
import { ActionTools } from './components/ActionTools';
import { Paginator } from './components/Paginator';
import { useOCRSearchResults } from './hooks/useOCRSearchResults';
import { useAnnotations } from './hooks/useAnnotations';
import { useEventAnnotations } from './hooks/useEventAnnotations';
import { getContainerId } from './utils/getContainerId';
import { useExtractedAnnotations } from './hooks/useExtractedAnnotations';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

const CHARTS_APPLICATION_ID = 'cognite-charts';

const defaultTranslations = makeDefaultTranslations(
  'Select a file to preview it',
  'No preview',
  'File types that can be previewed are',
  'Time series',
  'Asset not found'
);

export const FileViewer = ({ file }: { file?: FileInfo }) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'FileViewer').t,
  };
  const [ref, setRef] = useState<UnifiedViewer | undefined>(undefined);
  const [containerConfig, setContainerConfig] = useState<ContainerConfig>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const sdk = useSDK();

  const { extractedAnnotations } = useExtractedAnnotations(file);
  const { data: annotationsFromEvents } = useEventAnnotations(file);
  const { data: annotationsFromAnnotations } = useAnnotations(file);
  const { ocrSearchResultAnnotations } = useOCRSearchResults(file, searchQuery);

  const { annotations, popovers, onStageClick } = useUnifiedFileViewerState({
    file,
    annotationsFromEvents,
    annotationsFromAnnotations,
    extractedAnnotations,
    ocrSearchResultAnnotations,
    currentPage,
  });

  // reset when new file is loaded
  useEffect(() => {
    setCurrentPage(1);
    ref?.zoomToFit();
  }, [file, ref]);

  useEffect(() => {
    (async () => {
      if (file?.id && file?.mimeType) {
        const fileContainerConfig = await getContainerConfigFromFileInfo(
          sdk as any,
          file,
          {
            id: getContainerId(file.id),
            page: currentPage,
            maxWidth: MAX_CONTAINER_WIDTH,
            maxHeight: MAX_CONTAINER_HEIGHT,
          }
        );
        setContainerConfig(fileContainerConfig);
      }
    })();
  }, [file, currentPage]);

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

  if (!containerConfig) {
    return <Loader />;
  }

  return (
    <FileViewerWrapper>
      <ReactUnifiedViewer
        applicationId={CHARTS_APPLICATION_ID}
        id={ROOT_CONTAINER_ID}
        setRef={setRef}
        container={containerConfig}
        annotations={annotations}
        tooltips={popovers}
        onClick={onStageClick}
      />
      <ActionTools
        file={file}
        fileViewerRef={ref}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Paginator
        containerConfig={containerConfig}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </FileViewerWrapper>
  );
};

export const FileViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100vw;
  height: 95vh;
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 0 1px rgba(0, 0, 0, 1);
`;

const ErrorWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
