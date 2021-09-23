import React, { useEffect, useRef, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { CogniteOrnate } from 'library/cognite-ornate';
import {
  Drawing,
  OrnateAnnotation,
  OrnateAnnotationInstance,
  OrnateJSON,
  ToolType,
} from 'library/types';
import Konva from 'konva';
import WorkSpaceSidebar from 'components/WorkSpaceSidebar';
import WorkSpaceTools from 'components/WorkSpaceTools';
import { storage } from '@cognite/storage';

interface OrnateProps {
  client: CogniteClient;
}
const Ornate: React.FC<OrnateProps> = ({ client }: OrnateProps) => {
  const ornateViewer = useRef<CogniteOrnate>();
  const [activeTool, setActiveTool] = useState<ToolType>('default');
  const currentWorkspaceId = 'my_workspace_1';

  useEffect(() => {
    ornateViewer.current = new CogniteOrnate({
      container: '#container',
    });
  }, []);

  const onAnnotationClick = async (data: OrnateAnnotationInstance) => {
    if (data.annotation?.metadata?.type === 'file') {
      const { resourceId } = data.annotation.metadata;
      if (!resourceId) {
        return;
      }
      const file = await client.files.retrieve([{ id: Number(resourceId) }]);

      if (!file) {
        return;
      }

      const fileInfo = await loadFile(file[0].id);
      if (!fileInfo) {
        return;
      }
      const { doc, instances = [] } = fileInfo;
      const endPointAnnotation = instances.find(
        (x) =>
          x.annotation.metadata?.resourceId === data.document?.metadata?.fileId
      );
      if (!doc) {
        return;
      }
      ornateViewer.current!.connectDocuments(
        data.document,
        doc,
        { x: data.instance.x(), y: data.instance.y() },
        data.instance,
        endPointAnnotation?.instance
      );
    }

    if (data.annotation?.metadata?.type === 'asset') {
      console.log('asset');
    }
  };

  const onToolChange = (tool: ToolType) => {
    ornateViewer.current!.handleToolChange(tool);
    setActiveTool(tool);
  };

  const loadFile = async (
    fileId: number | string,
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
    }
  ) => {
    const { initialPosition = { x: 0, y: 0 }, zoomAfterLoad = true } =
      options || {};
    const existingDoc = ornateViewer.current!.documents.find(
      (doc) => doc.metadata?.fileId === String(fileId)
    );
    if (existingDoc) {
      console.log('document already exists!');
      ornateViewer.current!.zoomToDocument(existingDoc);
      return {};
    }
    const urls = await client.files.getDownloadUrls([{ id: +fileId }]);
    if (!urls[0]) {
      console.error('Failed to get URL');
      throw new Error('Failed to get URL');
    }

    const newDoc = await ornateViewer.current!.addPDFDocument(
      urls[0].downloadUrl,
      1,
      { fileId: String(fileId) },
      { initialPosition, zoomAfterLoad, groupId: String(fileId) }
    );

    const idEvents = await client.events.list({
      filter: {
        type: 'cognite_annotation',
        metadata: {
          CDF_ANNOTATION_file_id: String(fileId),
        },
      },
    });

    const annotations = idEvents.items.map((event) => {
      const box = JSON.parse(event.metadata?.CDF_ANNOTATION_box || '') as {
        yMin: number;
        yMax: number;
        xMin: number;
        xMax: number;
      };
      const type = event.metadata?.CDF_ANNOTATION_resource_type || 'unknown';
      const newAnnotation: OrnateAnnotation = {
        type: 'pct',
        x: box.xMin,
        y: box.yMin,
        width: box.xMax - box.xMin,
        height: box.yMax - box.yMin,
        fill:
          type === 'asset'
            ? 'rgba(74, 103, 251, 0.25)'
            : 'rgba(255, 184, 0, 0.25)',
        stroke:
          type === 'asset'
            ? 'rgba(74, 103, 251, 0.8)'
            : 'rgba(255, 184, 0, 0.8)',
        strokeWidth: 2,
        onClick: onAnnotationClick,
        metadata: {
          type,
          resourceId: event.metadata?.CDF_ANNOTATION_resource_id || '',
        },
      };
      return newAnnotation;
    });
    const instances = ornateViewer.current!.addAnnotationsToGroup(
      newDoc,
      annotations
    );

    return {
      doc: newDoc,
      instances,
    };
  };

  const onExport = async () => {
    const rects = ornateViewer.current!.documents.map((x) =>
      // @ts-ignore - relativeTo DOES work with stage.
      x.group.getClientRect({ relativeTo: ornateViewer.current!.stage })
    );
    console.log(rects);
    ornateViewer.current!.documents.forEach(async (doc) => {
      const tempPrevScale = ornateViewer.current!.stage.scale();
      ornateViewer.current!.stage.scale({ x: 1, y: 1 });
      doc.kImage.hide();
      doc.group.add(
        new Konva.Rect({
          fill: 'rgba(0, 0, 0, 0)',
          opacity: 0,
          x: 0,
          y: 0,
          width: doc.group.width(),
          height: doc.group.height(),
        })
      );
      doc.group.draw();
      const dataURL = doc.group.toDataURL();
      doc.kImage.show();
      ornateViewer.current!.stage.scale(tempPrevScale);

      console.log(dataURL);
      // This gives us the overlays. Just plop this ontop of the PDF in the right scale using PDF-LIB and we're golden!

      // const newCanvas = this.ornateViewer.baseLayer.toCanvas(rect);
      // const imageData = newCanvas.getContext('2d').getImageData(0, 0, newCanvas.width, newCanvas.height);
      // console.log(imageData);
    });
  };

  const onSave = () => {
    const json = ornateViewer.current!.exportToJSON();
    const parsedJson = {
      documents: json.documents.map((doc) => {
        return {
          ...doc,
          drawings: doc.drawings.filter(
            (drawing) => drawing.attrs.userGenerated
          ),
        };
      }),
    };
    storage.saveToLocalStorage(currentWorkspaceId, parsedJson);
  };

  const onLoad = () => {
    const storageData =
      storage.getFromLocalStorage<OrnateJSON>(currentWorkspaceId);
    if (!storageData) return;
    ornateViewer.current!.restart();

    storageData!.documents.forEach((doc) => {
      loadFile(doc.metadata.fileId, {
        initialPosition: { x: doc.x, y: doc.y },
        zoomAfterLoad: false,
      }).then((x) => {
        const parsedDrawings: Drawing[] = doc.drawings.map((drawing) => {
          return {
            ...drawing,
            groupId: x.doc?.group.id(),
          };
        });
        ornateViewer.current!.addDrawings(...parsedDrawings);
      });
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WorkSpaceSidebar title="My workspace" onLoadFile={loadFile} />
      <WorkSpaceTools onToolChange={onToolChange} activeTool={activeTool} />
      <div id="container" />

      <div style={{ position: 'fixed', bottom: '16px', left: '416px' }}>
        <button type="button" onClick={onExport}>
          Export
        </button>

        <button type="button" onClick={onSave}>
          Save
        </button>

        <button type="button" onClick={onLoad}>
          Load
        </button>
      </div>
    </div>
  );
};

export default Ornate;
