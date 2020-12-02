import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { FileInfo } from '@cognite/sdk';
import * as pdfjs from 'pdfjs-dist';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  convertCogniteAnnotationToIAnnotation,
} from '@cognite/react-picture-annotation';
import { Loader } from 'lib/components';
import styled from 'styled-components';
import { isFilePreviewable } from 'lib/utils/FileUtils';
import {
  PendingCogniteAnnotation,
  CURRENT_VERSION,
  AnnotationStatus,
} from '@cognite/annotations';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
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
import { AnnotationPreviewSidebar } from './AnnotationPreviewSidebar';
import { useAnnotations } from '../hooks';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

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

type FilePreviewProps = {
  fileId: number;
  creatable: boolean;
  contextualization: boolean;
};
export const FilePreview = ({
  fileId,
  creatable,
  contextualization,
}: FilePreviewProps) => {
  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  useEffect(() => {
    setPendingAnnotations([]);
  }, [fileId]);
  useEffect(() => {
    if (!creatable) {
      setPendingAnnotations([]);
    }
  }, [creatable]);

  const { data: file, isFetched: fileFetched } = useCdfItem<FileInfo>('files', {
    id: fileId,
  });
  const canPreviewFile = file && isFilePreviewable(file);

  const findSimilarJobId = useFindSimilarJobId(fileId);
  const { data: similarData } = useJob(findSimilarJobId, 'findsimilar');
  const { annotations: findSimilarItems } = similarData || {};
  const findSimilarAnnotations =
    findSimilarJobId && findSimilarItems
      ? findSimilarItems.map(convertAnnotation(findSimilarJobId, fileId))
      : [];

  const findObjectsJobId = useFindObjectsJobId(fileId);
  const { data: objectData } = useJob(findObjectsJobId, 'findobjects');
  const { annotations: findObjectsItems } = objectData || {};
  const findObjectsAnnotations =
    findObjectsJobId && findObjectsItems
      ? findObjectsItems.map(convertAnnotation(findObjectsJobId, fileId))
      : [];

  const persistedAnnotations = useAnnotations(fileId);
  const allAnnotations = [
    ...persistedAnnotations,
    ...pendingAnnotations,
    ...findSimilarAnnotations,
    ...findObjectsAnnotations,
  ].filter(removeSimilarAnnotations);

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
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <CogniteFileViewer.FileViewer
          file={file}
          creatable={creatable}
          annotations={allAnnotations}
          hideDownload
          hideSearch
          renderAnnotation={(annotation, isAnnotationSelected) => {
            const iAnnotation = convertCogniteAnnotationToIAnnotation(
              annotation,
              isAnnotationSelected,
              false
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
      <AnnotationPreviewSidebar
        fileId={fileId}
        setPendingAnnotations={setPendingAnnotations}
        contextualization={contextualization}
      />
    </div>
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
