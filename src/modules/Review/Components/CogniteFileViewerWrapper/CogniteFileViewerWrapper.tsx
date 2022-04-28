import React, { useMemo, useState } from 'react';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  ViewerEditCallbacks,
} from '@cognite/react-picture-annotation';
import sdk from '@cognite/cdf-sdk-singleton';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import {
  AnnotationStatus,
  AnnotationUtilsV1,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import * as pdfjs from 'pdfjs-dist';
import { FilePreviewProps } from 'src/modules/Review/types';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.js`;

export type DrawFunction = (
  canvas: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => void;

export type AnnotationStyle = {
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  highlight?: boolean;
  draw?: DrawFunction;
};

export type StyledVisionAnnotation = Required<VisionAnnotationV1> & {
  mark: AnnotationStyle;
};

const LoaderView = () => {
  return (
    <LoaderContainer>
      <Icon type="Loading" />
    </LoaderContainer>
  );
};

export const CogniteFileViewerWrapper: React.FC<FilePreviewProps> = ({
  annotations,
  fileInfo,
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

  const [selectedAnnotation, setSelectedAnnotation] =
    useState<ProposedCogniteAnnotation>();

  const styledAnnotations: any[] = annotations.map((item) => ({
    ...item,
    status: item.status,
    mark: getAnnotationStyle(
      item.color,
      item.status,
      item.id === Number(selectedAnnotation?.id)
    ),
    version: 1,
  }));

  const handleAnnotationSelected = (annotation: ProposedCogniteAnnotation) => {
    setSelectedAnnotation(annotation);
  };

  return (
    <CogniteFileViewer
      overrideURLMap={{
        pdfjsWorkerSrc:
          '/dependencies/pdfjs-dist@2.6.347/build/pdf.worker.min.js',
      }}
      sdk={sdk}
      file={fileInfo}
      disableAutoFetch
      hideDownload
      hideSearch
      creatable={creatable}
      editable={editable}
      editCallbacks={callbacks}
      annotations={styledAnnotations}
      allowCustomAnnotations
      loader={<LoaderView />}
      onAnnotationSelected={(annotation) => {
        handleAnnotationSelected(annotation[0] as ProposedCogniteAnnotation); // TODO: not sure why a list is returned here?
      }}
    />
  );
};

const LoaderContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function getAnnotationStyle(
  color: string,
  status?: AnnotationStatus,
  selected?: boolean
): AnnotationStyle {
  const lineColor = color;
  const { lineWidth } = AnnotationUtilsV1;

  if (status && status === AnnotationStatus.Verified) {
    return {
      strokeColor: lineColor,
      strokeWidth: lineWidth,
      highlight: false,
      backgroundColor: selected ? `${lineColor}20` : undefined,
    };
  }

  const drawDashedRectangle = (
    canvas: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    canvas.beginPath();
    /* eslint-disable no-param-reassign */
    canvas.strokeStyle = lineColor;
    canvas.lineWidth = lineWidth;
    /* eslint-enable no-param-reassign */
    canvas.setLineDash([5, 5]);
    canvas.moveTo(x, y);
    canvas.rect(
      x - lineWidth / 2,
      y - lineWidth / 2,
      width + lineWidth,
      height + lineWidth
    );
    canvas.stroke();
  };

  return {
    draw: drawDashedRectangle,
  };
}
