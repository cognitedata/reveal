import {
  CogniteOrnate,
  OrnateAnnotation,
  OrnateAnnotationInstance,
  OrnatePDFDocument,
} from '@cognite/ornate';
import { CogniteEvent, FileInfo } from '@cognite/sdk';
import { useCallback, useRef, useState } from 'react';
import Konva from 'konva';

const ANNOTATION_COLORS = {
  selected: 'rgb(74, 103, 251, 0.75)', // Primary blue
  assetDefault: 'rgb(255, 187, 0, 0.75)', // Yellow
  file: 'rgba(255, 105, 24, 0.75)', // Midorange
};

export default () => {
  const ornateViewer = useRef<CogniteOrnate>();

  const [selectedAnnotation, setSelectedAnnotation] =
    useState<OrnateAnnotationInstance>();

  const getAnnotationColor = useCallback(
    (type: string, isSelected: boolean) => {
      if (type === 'asset') {
        if (isSelected) {
          return ANNOTATION_COLORS.selected;
        }
        return ANNOTATION_COLORS.assetDefault;
      }
      return ANNOTATION_COLORS.file;
    },
    []
  );

  const updateSelectedAnnotation = useCallback(
    (assetId: string) => {
      const { baseLayer } = ornateViewer.current!;
      baseLayer.find(`.annotation`).forEach((x) => {
        if (x.attrs.metadata?.resourceId === assetId) {
          x.attrs.stroke = getAnnotationColor(
            x.attrs.metadata?.type || 'unknown',
            true
          );
          x.attrs.strokeWidth = 5;
        } else {
          x.attrs.stroke = getAnnotationColor(
            x.attrs.metadata?.type || 'unknown',
            false
          );
          x.attrs.strokeWidth = 2;
        }
      });
      baseLayer.draw(); // Some annotation colors are not updated without drawing the layer here
    },
    [ornateViewer.current]
  );

  const onAnnotationClick = useCallback(
    (data: OrnateAnnotationInstance) => {
      const assetId = data.annotation?.metadata?.resourceId;

      if (!assetId) {
        return;
      }
      updateSelectedAnnotation(assetId);
      setSelectedAnnotation(data);
    },
    [updateSelectedAnnotation, setSelectedAnnotation]
  );

  const mapEventToAnnotation = (
    event: CogniteEvent,
    fileId: number,
    options?: {
      selectedAssetId?: number;
    }
  ) => {
    const box = JSON.parse(event.metadata?.CDF_ANNOTATION_box || '') as {
      yMin: number;
      yMax: number;
      xMin: number;
      xMax: number;
    };
    const type = event.metadata?.CDF_ANNOTATION_resource_type || 'unknown';
    const isSelected =
      !!options?.selectedAssetId &&
      options?.selectedAssetId.toString() ===
        event.metadata?.CDF_ANNOTATION_resource_id;
    const newAnnotation: OrnateAnnotation = {
      id: `${fileId}_${event.metadata?.CDF_ANNOTATION_resource_id}`,
      type: 'pct',
      x: box.xMin,
      y: box.yMin,
      width: (box.xMax - box.xMin) * 1.1,
      height: (box.yMax - box.yMin) * 1.1,
      stroke: getAnnotationColor(type, isSelected),
      strokeWidth: 2,
      onClick: onAnnotationClick,
      metadata: {
        type,
        resourceId: event.metadata?.CDF_ANNOTATION_resource_id || '',
        name: event.description || '',
      },
    };
    return newAnnotation;
  };
  const addAnnotationsToDoc = (
    annotationEvents: CogniteEvent[],
    doc: OrnatePDFDocument,
    fileId: number
  ) => {
    const annotations = annotationEvents.map((event) =>
      mapEventToAnnotation(event, fileId)
    );

    ornateViewer.current!.addAnnotationsToGroup(doc, annotations);
  };

  const addPDF = async ({
    file,
    annotationEvents,
    options,
  }: {
    file: FileInfo & {
      fileUrl: string;
      rawUploadId?: string;
      type: 'CDF' | 'FILE';
    };
    annotationEvents?: CogniteEvent[];
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
    };
  }) => {
    const { initialPosition, zoomAfterLoad = true } = options || {};

    const doc = await ornateViewer.current?.addPDFDocument(
      file.fileUrl,
      1,
      {
        type: file.type,
        fileId: String(file.id),
        fileName: file.name,
        fileExternalId: file.externalId || '',
        rawUploadId: file.rawUploadId || '',
      },
      {
        initialPosition: initialPosition || { x: 0, y: 0 },
        zoomAfterLoad,
        groupId: String(file.externalId),
      }
    );
    if (!doc) {
      return;
    }

    annotationEvents && addAnnotationsToDoc(annotationEvents, doc, file.id);

    if (zoomAfterLoad && doc) {
      ornateViewer.current?.zoomToDocument(doc);
    }
  };

  const addImage = (
    url: string,
    info: {
      rawUploadId?: string;
    } = {},
    options?: {
      initialPosition: { x: number; y: number };
    }
  ) => {
    const { initialPosition = { x: 0, y: 0 } } = options || {};
    const shape = new Konva.Image({
      x: initialPosition.x,
      y: initialPosition.y,
      image: undefined,
      rawUploadId: info.rawUploadId,
      name: 'csp-document-preview',
    });

    const imageObj = new Image();
    imageObj.src = url;
    (shape as Konva.Image).image(imageObj);

    ornateViewer.current?.addShape(shape);
  };

  return {
    ornateViewer,
    selectedAnnotation,
    setSelectedAnnotation,
    updateSelectedAnnotation,
    addPDF,
    addImage,
  };
};
