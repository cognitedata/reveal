import { useEffect, useRef } from 'react';
import { CogniteOrnate } from '@cognite/ornate';
import { FileInfo } from '@cognite/sdk';
import { useDocumentDownloadUrl } from 'hooks/useQuery/useDocumentDownloadUrl';
import Konva from 'konva';

type Props = {
  document: FileInfo;
};

const OrnatePreview = ({ document }: Props) => {
  const ornateViewer = useRef<CogniteOrnate>();

  const fileUrlQuery = useDocumentDownloadUrl(document);

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
      name: 'csp-document-preview',
      ...info,
    });

    const imageObj = new Image();
    imageObj.src = url;
    (shape as Konva.Image).image(imageObj);

    ornateViewer.current?.addShape(shape);
  };

  useEffect(() => {
    if (ornateViewer.current && fileUrlQuery.isSuccess) {
      ornateViewer.current?.restart();
      const fileUrl = fileUrlQuery.data;
      if (document.mimeType?.includes('pdf')) {
        addPDF(fileUrl, { ...document, type: 'CDF' });
      } else if (document.mimeType?.includes('image')) {
        addImage(fileUrl, {
          fileExternalId: document.externalId || '',
          fileId: document.id,
        });
      }
    }
  }, [document.id, fileUrlQuery.status, ornateViewer.current]);

  useEffect(() => {
    ornateViewer.current = new CogniteOrnate({
      container: '#ornate-container',
    });
  }, []);

  return <div id="ornate-container" />;
};

export default OrnatePreview;
