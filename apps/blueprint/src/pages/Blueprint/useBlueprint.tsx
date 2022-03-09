import { MutableRefObject, useContext } from 'react';
import { CogniteOrnate, OrnateJsonDocument } from '@cognite/ornate';
import Konva from 'konva';
import { AuthContext } from 'providers/AuthProvider';
import { IdEither } from '@cognite/sdk';

const useBlueprint = (
  ornateViewer: MutableRefObject<CogniteOrnate | undefined>
) => {
  const { client } = useContext(AuthContext);

  const addFileFromSave = async (doc: OrnateJsonDocument) => {
    const { x, y } = doc;
    const { fileId, fileExternalId } = doc.metadata;
    let ref: IdEither = { externalId: fileExternalId };
    if (!ref.externalId) {
      ref = { id: Number(fileId) };
    }
    const file = await client.files.retrieve([ref]).then((res) => res[0]);
    const fileURL = await client.files
      .getDownloadUrls([ref])
      .then((res) => res[0].downloadUrl);

    if (file.mimeType?.includes('pdf')) {
      return addPDF(
        fileURL,
        { ...file, type: 'CDF' },
        { initialPosition: { x, y }, zoomAfterLoad: false }
      );
    }
    if (file.mimeType?.includes('image')) {
      return addImage(fileURL, { fileId: file.id });
    }
    return null;
  };

  const addPDF = async (
    fileURL: string,
    info: {
      id?: number | string;
      rawUploadId?: string;
      name: string;
      externalId?: string;
      type: 'CDF' | 'FILE';
    },
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
    }
  ) => {
    const { initialPosition, zoomAfterLoad = true } = options || {};

    const doc = await ornateViewer.current?.addPDFDocument(
      fileURL,
      1,
      {
        type: info.type,
        fileId: String(info.id),
        fileName: info.name,
        fileExternalId: info.externalId || '',
        rawUploadId: info.rawUploadId || '',
      },
      {
        initialPosition: initialPosition || { x: 0, y: 0 },
        zoomAfterLoad,
        groupId: String(info.externalId),
      }
    );
    if (zoomAfterLoad && doc) {
      ornateViewer.current?.zoomToDocument(doc);
    }

    return doc;
  };

  const addImage = (
    url: string,
    info: {
      fileId?: number;
      fileExternalId?: string;
      rawUploadId?: string;
      externalId?: string;
    },
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
      name: 'blueprint-image',
      ...info,
    });

    const imageObj = new Image();
    imageObj.src = url;
    (shape as Konva.Image).image(imageObj);

    ornateViewer.current?.addShape(shape);
  };

  return { addImage, addPDF, addFileFromSave };
};

export default useBlueprint;
