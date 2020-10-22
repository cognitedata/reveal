/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FileInfo } from '@cognite/sdk';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  convertCogniteAnnotationToIAnnotation,
} from '@cognite/react-picture-annotation';
import { Splitter, Loader } from 'lib/components';
import styled from 'styled-components';
import { isFilePreviewable } from 'lib/utils/FileUtils';
import {
  PendingCogniteAnnotation,
  CURRENT_VERSION,
  AnnotationStatus,
} from '@cognite/annotations';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { useSDK } from '@cognite/sdk-provider';
import {
  PNID_ANNOTATION_TYPE,
  removeSimilarAnnotations,
} from 'lib/utils/AnnotationUtils';
import {
  useJob,
  useFindObjectsJobId,
  ObjectDetectionEntity,
  useFindSimilarJobId,
} from 'lib/hooks/objectDetection';
import { FileOverviewPanel } from './FileOverviewPanel';
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import { useAnnotations } from '../hooks';

type Props = {
  fileId: number;
  contextualization?: boolean;
};

const convertAnnotation = (jobId: number, fileId: number) => (
  el: ObjectDetectionEntity
): ProposedCogniteAnnotation => ({
  id: el.id,
  box: el.boundingBox,
  version: CURRENT_VERSION,
  fileId,
  type: PNID_ANNOTATION_TYPE,
  label: '',
  source: `job:${jobId}`,
  status: 'unhandled' as AnnotationStatus,
  metadata: {
    fromSimilarObject: 'true',
    score: `${el.score}`,
    originalBoxJson: `${jobId}`,
  },
});

const FilePreview = ({ fileId, contextualization = false }: Props) => {
  const [creatable, setCreatable] = useState(false);

  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  useEffect(() => {
    setPendingAnnotations([]);
  }, [fileId]);

  const findObjectsJobId = useFindObjectsJobId(fileId);
  const { data: objectData } = useJob(findObjectsJobId);
  const { annotations: findObjectsItems } = objectData || {};
  const findObjectsAnnotations =
    findObjectsJobId && findObjectsItems
      ? findObjectsItems.map(convertAnnotation(findObjectsJobId, fileId))
      : [];

  const findSimilarJobId = useFindSimilarJobId(fileId);
  const { data: similarData } = useJob(findSimilarJobId);
  const { annotations: findSimilarItems } = similarData || {};
  const findSimilarAnnotations =
    findSimilarJobId && findSimilarItems
      ? findSimilarItems.map(convertAnnotation(findSimilarJobId, fileId))
      : [];

  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>(
    'files',
    { id: fileId! },
    {
      enabled: !!fileId,
    }
  );

  const persistedAnnotations = useAnnotations(fileId);
  const allAnnotations = [
    ...persistedAnnotations,
    ...pendingAnnotations,
    ...findSimilarAnnotations,
    ...findObjectsAnnotations,
  ].filter(removeSimilarAnnotations);

  const canPreviewFile = file && isFilePreviewable(file);

  const content = () => {
    if (!fileFetched) {
      return <Loader />;
    }

    if (!canPreviewFile) {
      return (
        <CenteredPlaceholder>
          <h1>No Preview For File</h1>
          <p>Please search for a File to start viewing.</p>
        </CenteredPlaceholder>
      );
    }
    return (
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
              return false;
            },
            onUpdate: () => {
              return false;
            },
          }}
        />
      </div>
    );
  };

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
        {content()}
      </Splitter>
      <AnnotationPreviewSidebar
        fileId={fileId}
        pendingAnnotations={pendingAnnotations}
        setPendingAnnotations={setPendingAnnotations}
        contextualization={contextualization}
      />
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
  const sdk = useSDK();
  return (
    <CogniteFileViewer.Provider sdk={sdk} disableAutoFetch>
      <FilePreview {...props} />
    </CogniteFileViewer.Provider>
  );
};

export { WrappedFilePreview as FilePreview };
