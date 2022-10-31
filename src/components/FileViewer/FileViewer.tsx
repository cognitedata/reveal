import { useEffect, useMemo, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { FileInfo } from '@cognite/sdk';
import ReactUnifiedViewer, {
  ContainerConfig,
  ContainerType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import styled from 'styled-components/macro';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { useAssetAnnotations } from 'components/FileList/hooks';
import {
  isFilePreviewable,
  readablePreviewableFileTypes,
} from 'components/FileList/utils';
import { Loader } from './components/Loader';
import { useDownloadUrl } from './hooks/useDownloadUrl';
import { useAnnotations } from './hooks/useAnnotations';
import { mapContainerToMimeType } from './utils/mapContainerToMimeType';
import {
  FILE_CONTAINER_ID,
  MAX_CONTAINER_HEIGHT,
  MAX_CONTAINER_WIDTH,
  ROOT_CONTAINER_ID,
} from './constants';
import { ActionTools } from './components/ActionTools';
import { Paginator } from './components/Paginator';
import { useSearchResultsToShow } from './hooks/useSearchResultsToShow';

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fileUrl = useDownloadUrl(file);
  const { data: assetAnnotations } = useAssetAnnotations(file);
  const { annotations, popovers, setClickedId } = useAnnotations({
    assetAnnotations,
    currentPage,
  });
  const { searchResultAnnotations } = useSearchResultsToShow(file, searchQuery);

  const fileViewerContainerType = useMemo(
    () => mapContainerToMimeType(file),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileUrl]
  );

  const onStageClick = () => {
    setClickedId(undefined);
  };

  useEffect(() => {
    setCurrentPage(1);
    ref?.zoomToFit();
  }, [file, ref]);

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

  if (!fileUrl) {
    return <Loader />;
  }

  const container: ContainerConfig = {
    type: ContainerType.ROW,
    shouldRenderCompactly: true,
    id: ROOT_CONTAINER_ID,
    children: [
      {
        id: FILE_CONTAINER_ID,
        type: fileViewerContainerType,
        url: fileUrl,
        maxWidth: MAX_CONTAINER_WIDTH,
        maxHeight: MAX_CONTAINER_HEIGHT,
        page: currentPage,
      },
    ],
  };

  return (
    <FileViewerWrapper>
      <ReactUnifiedViewer
        applicationId={CHARTS_APPLICATION_ID}
        id={ROOT_CONTAINER_ID}
        setRef={setRef}
        container={container}
        annotations={[...annotations, ...searchResultAnnotations]}
        tooltips={popovers}
        onClick={onStageClick}
      />
      <ActionTools
        file={file}
        fileUrl={fileUrl}
        fileViewerRef={ref}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Paginator
        file={file}
        fileUrl={fileUrl}
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
