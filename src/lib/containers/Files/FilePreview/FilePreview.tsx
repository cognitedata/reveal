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
import {
  isFilePreviewable,
  readablePreviewableFileTypes,
} from 'lib/utils/FileUtils';
import {
  PendingCogniteAnnotation,
  CURRENT_VERSION,
  AnnotationStatus,
  CogniteAnnotation,
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
import { ResourceItem } from 'lib/types/Types';
import { Colors } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
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
  onItemClicked?: (item: ResourceItem) => void;
};
export const FilePreview = ({
  fileId,
  creatable,
  contextualization,
  onItemClicked,
}: FilePreviewProps) => {
  const [pendingAnnotations, setPendingAnnotations] = useState<
    ProposedCogniteAnnotation[]
  >([]);

  const isBPEnabled = useFlag('BP_FILE_EXPERIMENT', {
    fallback: false,
    forceRerender: true,
  });

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
    ...[
      ...pendingAnnotations,
      ...findSimilarAnnotations,
      ...findObjectsAnnotations,
    ].filter(removeSimilarAnnotations),
  ];

  if (!fileFetched) {
    return <Loader />;
  }

  if (!canPreviewFile) {
    return (
      <CenteredPlaceholder>
        <h1>No preview for this type of file</h1>
        <p>
          File types that can be previewed are: {readablePreviewableFileTypes()}
        </p>
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
          renderAnnotation={(annotation, isAnnotationSelected) => {
            const iAnnotation = convertCogniteAnnotationToIAnnotation(
              annotation,
              isAnnotationSelected,
              false
            );
            if (annotation.metadata && annotation.metadata.color) {
              iAnnotation.mark.strokeColor = annotation.metadata.color;
            }
            // TODO(CDFUX-000): BP Specific!
            if (
              annotation.metadata &&
              annotation.metadata.BP_SHOULD_NOTIFY &&
              isBPEnabled
            ) {
              iAnnotation.mark.draw = (canvas, x, y) => {
                canvas.save();
                canvas.translate(x, y);
                drawWarning(canvas);
                canvas.restore();
                return true;
              };
            }
            // iAnnotation.mark.draw = (canvas, x, y) => {
            //   if (annotation.resourceType) {
            //     canvas.save();
            //     // circle
            //     canvas.translate(x - 20, y - 3);
            //     canvas.fillStyle = `${
            //       iAnnotation.mark.strokeColor || Colors['midblue-3'].hex()
            //     }80`;
            //     canvas.beginPath();
            //     canvas.arc(8, 8, 8, 0, 2 * Math.PI, false);
            //     canvas.closePath();
            //     canvas.fill();
            //     // Icon
            //     drawIcon(canvas, annotation);
            //     canvas.restore();
            //   }
            //   return true;
            // };
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
        onItemClicked={onItemClicked}
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

const drawWarning = (canvas: CanvasRenderingContext2D) => {
  canvas.save();
  canvas.translate(-20, 0);
  canvas.beginPath();
  canvas.fillStyle = Colors.warning.hex();
  canvas.arc(8, 8, 8, 0, 2 * Math.PI);
  canvas.fill();
  canvas.closePath();
  canvas.fillStyle = '#fff';
  canvas.fill(new Path2D('M9 9H7L7 4L9 4L9 9Z'));
  canvas.fill(
    new Path2D(
      'M9 11C9 11.5523 8.55228 12 8 12C7.44772 12 7 11.5523 7 11C7 10.4477 7.44772 10 8 10C8.55228 10 9 10.4477 9 11Z'
    )
  );
  canvas.restore();
};

export const drawIcon = (
  canvas: CanvasRenderingContext2D,
  annotation: CogniteAnnotation | PendingCogniteAnnotation
) => {
  canvas.save();
  canvas.beginPath();
  canvas.fillStyle = '#fff';
  canvas.strokeStyle = '#fff';
  canvas.translate(2, 2);
  canvas.scale(0.75, 0.75);
  switch (annotation.resourceType) {
    case 'asset': {
      canvas.fill(
        new Path2D(
          'M4.5 14.3145L1.0001 8.15729L4.50002 2L5.76179 4.21977L3.52348 8.15754L5.76162 12.095L4.5 14.3145ZM5.76165 12.0951L5.76162 12.095L7.99986 8.15736H7.99991L5.76165 12.0951ZM12.6024 8.15745L12.6024 8.15754L10.3327 12.1506L5.79321 12.1506L5.76165 12.0951L4.50002 14.3146L4.5 14.3145L4.49993 14.3147H11.4998L14.9997 8.15745H15.0001L11.5002 2.00016L4.50031 2.00016L5.76188 4.2196L5.76179 4.21977L7.99995 8.15729L7.99991 8.15736H8.00019L8.00024 8.15745H12.6024ZM12.6023 8.15737L8.00019 8.15736L5.76188 4.2196L5.79321 4.16449L10.3327 4.16449L12.6023 8.15737ZM12.6023 8.15737H14.9997L14.9997 8.15745H12.6024L12.6023 8.15737Z'
        )
      );
      return;
    }
    case 'file': {
      canvas.stroke(new Path2D('M10.75 6.25H5.5V8H10.75V6.25Z'));
      canvas.stroke(new Path2D('M5.5 9.75H10.75V11.5H5.5V9.75Z'));
      canvas.fill(
        new Path2D(
          'M14.25 15H2V1H11.625L14.25 3.625V15ZM12.5 4.5H10.75V2.75H3.75V13.25H12.5V4.5Z'
        ),
        'evenodd'
      );
      return;
    }
    case 'event': {
      canvas.fill(
        new Path2D(
          'M11.5 1V2.75H15V15H1V2.75H4.5V1H6.25V2.75H9.75V1H11.5ZM2.75 13.25V4.5H13.25V13.25H2.75ZM11.0496 5.48124L6.71859 9.81227L4.86244 7.95612L3.625 9.19355L6.71859 12.2871L12.2871 6.71868L11.0496 5.48124Z'
        ),
        'evenodd'
      );
      return;
    }
    case 'sequence': {
      canvas.fillRect(0, 5.85, 2.15, 4.3);
      canvas.fillRect(5.85, 5.85, 4.3, 4.3);
      canvas.fillRect(13.85, 5.85, 2.15, 4.3);
      return;
    }
    case 'timeSeries': {
      canvas.fill(
        new Path2D(
          'M15 4.19407C15 4.85354 14.4758 5.38815 13.8291 5.38815C13.1825 5.38815 12.6583 4.85354 12.6583 4.19407C12.6583 3.53461 13.1825 3 13.8291 3C14.4758 3 15 3.53461 15 4.19407Z'
        )
      );
      canvas.fill(
        new Path2D(
          'M12.6081 7.12804L10.9522 5.43936L7.53576 8.92355L5.3405 6.68477L1 11.1113L2.65584 12.8L5.3405 10.0621L7.53575 12.3009L12.6081 7.12804Z'
        )
      );
    }
  }
  canvas.closePath();
  canvas.restore();
};
