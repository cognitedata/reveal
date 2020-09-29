/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useContext,
} from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import { itemSelector } from '@cognite/cdf-resources-store/dist/files';
import { selectAnnotations } from 'modules/annotations';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  convertCogniteAnnotationToIAnnotation,
} from '@cognite/react-picture-annotation';
import { Splitter, Loader } from 'components/Common';
import styled from 'styled-components';
import { isFilePreviewable } from 'utils/FileUtils';
import { AnnotationPreviewSidebar } from 'containers/Files/FilePreview/AnnotationPreviewSidebar';
import { v4 as uuid } from 'uuid';
import { PendingCogniteAnnotation } from '@cognite/annotations';
import { FileOverviewPanel } from 'containers/Files/FilePreview/FileOverviewPanel';
import { fetchResourceForAnnotation } from 'utils/AnnotationUtils';
import { ContextualizationModule } from 'containers/Files/FilePreview/ContextualizationModule';
import { getSDK } from 'utils/SDK';
import { SIDEBAR_RESIZE_EVENT } from 'utils/WindowEvents';

type Props = {
  fileId?: number;
  contextualization?: boolean;
  page?: number;
  onPageChange?: (newPage: number) => void;
};

const FilePreview = ({
  fileId,
  contextualization = false,
  page,
  onPageChange,
}: Props) => {
  const dispatch = useResourcesDispatch();
  const file = useResourcesSelector(itemSelector)(fileId);
  const [creatable, setCreatable] = useState(false);

  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  const {
    page: pageFromStore,
    selectedAnnotation,
    setSelectedAnnotation,
  } = useContext(CogniteFileViewer.Context);

  const getAnnotations = useResourcesSelector(selectAnnotations);
  const annotations = useMemo(() => getAnnotations(fileId), [
    fileId,
    getAnnotations,
  ]);

  const allAnnotations = useMemo(
    () => [...annotations, ...pendingAnnotations],
    [annotations, pendingAnnotations]
  );

  useEffect(() => {
    if (!!page && pageFromStore !== page && onPageChange) {
      onPageChange(page);
    }
  }, [pageFromStore, page, onPageChange]);

  const canPreviewFile = useMemo(() => isFilePreviewable(file), [file]);

  const renderContent = useCallback(() => {
    if (file) {
      if (canPreviewFile) {
        return (
          <CogniteFileViewer.FileViewer
            file={file}
            creatable={creatable}
            annotations={allAnnotations}
            hideDownload
            hideSearch
            renderAnnotation={(annotation, isSelected) => {
              const iAnnotation = convertCogniteAnnotationToIAnnotation(
                annotation,
                isSelected
              );
              if (annotation.metadata && annotation.metadata.color) {
                iAnnotation.mark.strokeColor = annotation.metadata.color;
              }
              return iAnnotation;
            }}
            editCallbacks={{
              onCreate: (item: PendingCogniteAnnotation) => {
                const newItem = { ...item, id: uuid() };
                setPendingAnnotations([newItem]);
                setSelectedAnnotation(newItem);
                return false;
              },
              onUpdate: () => {
                return false;
              },
            }}
          />
        );
      }
      return (
        <CenteredPlaceholder>
          <h1>No Preview For File</h1>
          <p>Please search for a File to start viewing.</p>
        </CenteredPlaceholder>
      );
    }
    return <Loader />;
  }, [file, canPreviewFile, creatable, allAnnotations, setSelectedAnnotation]);

  useEffect(() => {
    if (selectedAnnotation) {
      dispatch(fetchResourceForAnnotation(selectedAnnotation));
    }
    setTimeout(
      () => window.dispatchEvent(new Event(SIDEBAR_RESIZE_EVENT)),
      200
    );
  }, [dispatch, selectedAnnotation]);

  useEffect(() => {
    setPendingAnnotations([]);
  }, [fileId]);

  return (
    <>
      <Splitter primaryIndex={1}>
        <FileOverviewPanel
          fileId={fileId}
          pendingAnnotations={pendingAnnotations}
          setPendingAnnotations={setPendingAnnotations}
          creatable={creatable}
          setCreatable={setCreatable}
          contextualization={contextualization}
        />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {renderContent()}
        </div>
      </Splitter>
      <AnnotationPreviewSidebar
        fileId={fileId}
        pendingAnnotations={pendingAnnotations}
        setPendingAnnotations={setPendingAnnotations}
        contextualization={contextualization}
      />
      {contextualization && (
        <ContextualizationModule
          fileId={fileId}
          pendingAnnotations={pendingAnnotations}
          setPendingAnnotations={setPendingAnnotations}
        />
      )}
    </>
  );
};
const CenteredPlaceholder = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  text-align: center;
`;

const WrappedFilePreview = (props: Props) => {
  const sdk = getSDK();
  return (
    <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
      <FilePreview {...props} />
    </CogniteFileViewer.Provider>
  );
};

export { WrappedFilePreview as FilePreview };
