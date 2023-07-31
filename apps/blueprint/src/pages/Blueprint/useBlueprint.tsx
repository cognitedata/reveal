import { MutableRefObject, useContext, useState } from 'react';
import { AuthContext } from 'providers/AuthProvider';
import { FileInfo } from '@cognite/sdk';
import {
  CogniteOrnate,
  FileURL,
  getAnnotationsFromCDF,
  getFileFromCDF,
  OrnateFileAnnotation,
  Rect,
} from 'ornate';
import { v4 as uuid } from 'uuid';
import Konva from 'konva';

const useBlueprint = (
  ornateViewer: MutableRefObject<CogniteOrnate | undefined>
) => {
  const { client } = useContext(AuthContext);
  const [annotationLabels, setAnnotationLabels] = useState<
    OrnateFileAnnotation[]
  >([]);

  const handleAnnotationClick = async (
    nextAnnotation: OrnateFileAnnotation,
    shape: Konva.Rect
  ) => {
    if (nextAnnotation.resourceType === 'asset') {
      let assetExternalId: string | undefined =
        nextAnnotation.metadata?.assetExternalId;
      if (!assetExternalId) {
        assetExternalId = await client.assets
          .retrieve([{ id: Number(nextAnnotation.metadata?.assetId) }])
          .then((res) => res[0]?.externalId);
      }
      console.log(assetExternalId, nextAnnotation);
      if (!assetExternalId) {
        return;
      }
      const nextShape = new Rect({
        id: `${nextAnnotation.id}-shape`,
        x: shape.x(),
        y: shape.y(),
        width: shape.width(),
        height: shape.height(),
        ...ornateViewer.current?.style,
        fill: ornateViewer.current?.style.fill || 'blue',
        stroke: ornateViewer.current?.style.stroke || 'blue',
        userGenerated: true,
        name: 'drawing',
      });
      nextShape.shape.setAttr('coreAssetExternalId', assetExternalId);
      console.log(nextShape);
      ornateViewer.current?.addShape([nextShape]);
    }
  };
  const addFile = async (file: FileInfo) => {
    const fileURLShape = new FileURL({
      x: 0,
      y: 0,
      fill: 'red',
      id: uuid(),
      mimeType: file.mimeType,
      fileReference: {
        externalId: file.externalId!,
        id: String(file.id),
      },
      fileName: file.name,
      getURLFunc: getFileFromCDF(client),
      onLoadListeners: [
        (fileURLShape) => {
          ornateViewer.current?.zoomToID(fileURLShape.shape.id());
          ornateViewer.current?.emitSaveEvent();
        },
      ],
      getAnnotationsFunc: getAnnotationsFromCDF(client),
      onAnnotationsLoad: (nextAnnotations) => {
        setAnnotationLabels((current) => [
          ...(current || []),
          ...nextAnnotations,
        ]);
      },
      onAnnotationClick: (nextAnnotation, shape) => {
        handleAnnotationClick(nextAnnotation, shape);
      },
    });
    ornateViewer.current?.addShape([fileURLShape]);
  };

  return {
    addFile,
    annotationLabels,
    setAnnotationLabels,
    handleAnnotationClick,
  };
};

export default useBlueprint;
