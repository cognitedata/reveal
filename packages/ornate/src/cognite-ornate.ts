import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { v4 as uuid } from 'uuid';
import { Vector2d } from 'konva/lib/types';
import { PDFDocument } from 'pdf-lib';

import {
  OrnateAnnotation,
  ToolType,
  OrnateAnnotationInstance,
  OrnatePDFDocument,
  OrnateJSON,
  Drawing,
  ShapeSettings,
} from './types';
import { DefaultTool, CommentTool } from './tools';
import { Tool } from './tools/Tool';
import bgImage from './assets/bg.png';
import { downloadURL, pdfToImage, ConnectedLine } from './utils';

export const defaultShapeSettings = {
  strokeWidth: 10,
  strokeColor: '#FFDC7F',
  opacity: 1,
  fontSize: 32,
};

const sceneBaseWidth = window.innerWidth * 2;
const sceneBaseHeight = window.innerHeight * 2;

const SCALE_SENSITIVITY = 0.96;
const SCALE_MAX = 5;
const SCALE_MIN = 0.05;

export type CogniteOrnateOptions = {
  container: string;
};
export class CogniteOrnate {
  host: HTMLDivElement;
  documents: OrnatePDFDocument[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  stage: Konva.Stage;
  backgroundLayer: Konva.Layer = new Konva.Layer();
  baseLayer: Konva.Layer = new Konva.Layer();
  drawingLayer: Konva.Layer = new Konva.Layer();
  isDrawing = false;
  currentTool: Tool = new DefaultTool(this);
  connectedLineGroup: ConnectedLine[] = [];
  shapeSettings: ShapeSettings = defaultShapeSettings;
  tools: Record<string, Tool> = {};

  constructor(options: CogniteOrnateOptions) {
    const host = document.querySelector(options.container) as HTMLDivElement;
    if (!host) {
      // eslint-disable-next-line no-console
      console.error('ORNATE: Failed to get HTML element to attach to');
    }
    this.host = host;
    this.init();
  }

  init() {
    // Setup out stage
    this.stage = new Konva.Stage({
      container: this.host,
      width: sceneBaseWidth,
      height: sceneBaseHeight,
      scale: { x: 0.2, y: 0.2 },
    });

    // Add layers to stage
    this.stage.add(this.backgroundLayer);
    this.stage.add(this.baseLayer);
    this.stage.add(this.drawingLayer);

    // Initialise mouse events
    this.stage.on('mousedown', this.onStageMouseDown);
    this.stage.on('mousemove', this.onStageMouseMove);
    this.stage.on('mouseup', this.onStageMouseUp);
    this.stage.on('wheel', this.onStageMouseWheel);
    this.stage.on('mouseenter', () => {
      this.stage.container().style.cursor = this.currentTool.cursor;
    });
    this.currentTool.onInit();

    // Ensure responsiveness
    this.fitStageIntoParentContainer();
    window.addEventListener('resize', this.fitStageIntoParentContainer);

    this.initBackgroundLayer();
  }

  initBackgroundLayer = () => {
    const rectSize = 500000;
    const backgroundImage = new Image();
    backgroundImage.src = bgImage;
    const backgroundRect = new Konva.Rect({
      x: -rectSize / 2,
      y: -rectSize / 2,
      width: rectSize,
      height: rectSize,
      fillPatternImage: backgroundImage,
      unselectable: true,
    });
    const group = new Konva.Group();
    group.add(backgroundRect);
    this.backgroundLayer.add(group);
  };

  fitStageIntoParentContainer = () => {
    const containerWidth = this.host.parentElement!.offsetWidth;
    const containerHeight = this.host.parentElement!.offsetHeight;

    this.stage.width(containerWidth);
    this.stage.height(containerHeight);
  };

  handleShapeSettingsChange = (nextSettings: Partial<ShapeSettings>) => {
    const newSettings = {
      ...this.shapeSettings,
      ...nextSettings,
    };
    this.shapeSettings = newSettings;
    this.currentTool.shapeSettings = newSettings;
  };

  handleToolChange = (tool: ToolType) => {
    if (this.currentTool) {
      this.currentTool.onDestroy();
    }
    this.currentTool = this.tools[tool] || this.tools.default;
    this.currentTool.onInit();
    this.stage.container().style.cursor = this.currentTool.cursor;
    this.stage.on('mouseenter', () => {
      this.stage.container().style.cursor = this.currentTool.cursor;
    });
    const event = new CustomEvent('ornate_toolChange', { detail: tool });

    // Dispatch the event.
    document.dispatchEvent(event);
  };

  isCurrentToolUsingShapeSettings = () => {
    return this.currentTool.isToolUsingShapeSettings;
  };

  addPDFDocument = async (
    pdfURL: string,
    pageNumber: number,
    metadata: Record<string, string>,
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
      groupId?: string;
    }
  ): Promise<OrnatePDFDocument> => {
    const {
      initialPosition = { x: 0, y: 0 },
      zoomAfterLoad = true,
      groupId = uuid(),
    } = options || {};
    const base64 = await pdfToImage(pdfURL, pageNumber);
    return new Promise<OrnatePDFDocument>((res, rej) => {
      const group = new Konva.Group({
        id: groupId,
      });
      this.baseLayer.add(group);
      const image = new Image();
      image.onload = () => {
        const scale =
          image.width < sceneBaseWidth ? 1 : sceneBaseWidth / image.width;
        // Draw PDF image
        const kBaseImage = new Konva.Image({
          image,
          width: image.width,
          height: image.height,
          stroke: 'black',
          strokeWidth: 1,
          attachedToGroup: group.id(),
        });
        kBaseImage.image(image);

        group.x(initialPosition?.x || 0);
        group.y(initialPosition?.y || 0);
        group.width(image.width);
        group.height(image.height);
        group.add(kBaseImage);
        kBaseImage.zIndex(1);

        const baseRect = new Konva.Rect({
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
          fill: '#E8E8E8',
        });
        group.add(baseRect);
        baseRect.zIndex(0);

        group.on('dblclick', () => {
          this.zoomTo(group);
        });

        this.baseLayer.draw();
        if (zoomAfterLoad) {
          this.zoomTo(group, 0);
        }
        const newDocument: OrnatePDFDocument = {
          image,
          scale,
          annotations: [],
          group,
          kImage: kBaseImage,
          metadata,
        };
        this.documents.push(newDocument);
        res(newDocument);
      };
      image.onerror = (e) => {
        rej(e);
      };
      image.src = base64;
    });
  };

  addAnnotationsToGroup = (
    doc: OrnatePDFDocument,
    annotations: OrnateAnnotation[]
  ): OrnateAnnotationInstance[] => {
    const rects: OrnateAnnotationInstance[] = annotations.map((annotation) => ({
      annotation,
      instance: this.annotationToRect(
        annotation,
        doc,
        {
          width: doc.group.width(),
          height: doc.group.height(),
        },
        doc.group.id()
      ),
      document: doc,
    }));

    if (rects.length > 0) {
      doc.group.add(...rects.map((r) => r.instance));
      rects.forEach((rect) => {
        rect.instance.zIndex(2);
        // rect.instance.cache();
      });
      this.baseLayer.draw();
    }
    return rects;
  };

  onStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseDown) {
      this.currentTool.onMouseDown(e);
    }
  };

  onStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseMove) {
      this.currentTool.onMouseMove(e);
    }
  };

  onStageMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseUp) {
      this.currentTool.onMouseUp(e);
    }
    this.connectedLineGroup.forEach((l) => l.update());
  };

  onStageMouseWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    if (e.evt.ctrlKey) {
      this.onZoom(e.evt.deltaY, true);
      return;
    }
    const dx = e.evt.deltaX;
    const dy = e.evt.deltaY;

    const minX = -this.stage.width();
    const x = Math.max(minX, Math.min(this.stage.x() - dx));

    const minY = -this.stage.height();
    const y = Math.max(minY, Math.min(this.stage.y() - dy));

    this.stage.x(x);
    this.stage.y(y);
  };

  onZoom = (scale: number, pointer: boolean) => {
    const oldScale = this.stage.scale();
    let referencePoint = null;

    if (pointer) {
      referencePoint = this.stage.getPointerPosition();
    } else {
      referencePoint = {
        x: this.stage.container().clientWidth / 2,
        y: this.stage.container().clientHeight / 2,
      } as Vector2d;
    }

    if (!referencePoint) {
      return;
    }

    const referencePointTo = {
      x: (referencePoint.x - this.stage.x()) / oldScale.x,
      y: (referencePoint.y - this.stage.y()) / oldScale.y,
    };

    const newScale = {
      x:
        scale > 0
          ? oldScale.x * SCALE_SENSITIVITY
          : oldScale.x / SCALE_SENSITIVITY,
      y:
        scale > 0
          ? oldScale.y * SCALE_SENSITIVITY
          : oldScale.y / SCALE_SENSITIVITY,
    };

    if (
      newScale.x < SCALE_MIN ||
      newScale.y < SCALE_MIN ||
      newScale.x > SCALE_MAX ||
      newScale.y > SCALE_MAX
    ) {
      return;
    }

    this.stage.scale({ x: newScale.x, y: newScale.y });

    const newPos = {
      x: referencePoint.x - referencePointTo.x * newScale.x,
      y: referencePoint.y - referencePointTo.y * newScale.y,
    };
    this.stage.position(newPos);

    // Show / Hide rectangles based on scale
    const shouldShowRects = newScale.x > 0.1 || newScale.y > 0.1;
    this.documents.forEach((doc) => {
      if (!shouldShowRects) {
        doc.kImage.hide();
      } else {
        doc.kImage.show();
      }
    });
  };

  connectDocuments(
    documentStart: OrnatePDFDocument,
    documentEnd: OrnatePDFDocument,
    startPoint: { x: number; y: number },
    instanceA: Konva.Node,
    instanceB?: Konva.Node,
    zoomToDocument = true,
    repositionDocs = true
  ) {
    // Determine where to render (up, down, left or right) (renderDirection = [x, y])
    const normalizedX = startPoint.x - documentStart.kImage.x();
    const normalizedY = startPoint.y - documentStart.kImage.y();
    const xPct = normalizedX / documentStart.kImage.width();
    const yPct = normalizedY / documentStart.kImage.height();

    const inBottomLeft = xPct < yPct;
    const inTopRight = xPct > yPct;
    const inBottomRight = xPct + yPct > 1;
    const inTopLeft = xPct + yPct < 1;
    let renderDirection: [number, number] = [0, 0];
    const distanceBetween = 64;
    // Up
    if (inTopLeft && inTopRight) {
      renderDirection = [0, -1];
    }
    // Left
    if (inTopLeft && inBottomLeft) {
      renderDirection = [-1, 0];
    }
    // Down
    if (inBottomLeft && inBottomRight) {
      renderDirection = [0, 1];
    }
    // Right
    if (inTopRight && inBottomRight) {
      renderDirection = [1, 0];
    }

    const newX =
      documentStart.group.x() +
      renderDirection[0] * (documentStart.group.width() + distanceBetween);
    const newY =
      documentStart.group.y() +
      renderDirection[1] * (documentStart.group.height() + distanceBetween);

    if (repositionDocs) {
      documentEnd.group.x(newX);
      documentEnd.group.y(newY);
    }
    this.baseLayer.draw();

    const connectedLine = new ConnectedLine(
      instanceA,
      instanceB || documentEnd.group,
      this.stage
    );
    this.baseLayer.add(connectedLine.line);
    this.connectedLineGroup.push(connectedLine);

    if (zoomToDocument) {
      this.zoomToDocument(documentEnd);
    }
  }

  zoomTo(node: Konva.Node, duration = 0.35) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - relativeTo DOES accept this.stage just fine.
    const rect = node.getClientRect({ relativeTo: this.stage });
    const rawScale = Math.min(
      this.stage.width() / rect.width,
      this.stage.height() / rect.height
    );

    const scale = Math.min(Math.max(rawScale, SCALE_MIN), SCALE_MAX);

    // Scale the location, and center it to the screen
    const location = {
      x: -rect.x * scale + this.stage.width() / 2 - (node.width() * scale) / 2,
      y:
        -rect.y * scale + this.stage.height() / 2 - (node.height() * scale) / 2,
    };

    const { x, y } = location;
    const tween = new Konva.Tween({
      duration,
      easing: Konva.Easings.EaseInOut,
      node: this.stage,
      scaleX: scale,
      scaleY: scale,
      x,
      y,
    });
    tween.onFinish = () => tween.destroy();

    tween.play();
    this.stage.batchDraw();
  }

  zoomToDocument(doc: OrnatePDFDocument) {
    // get layers
    const node = doc.group;
    this.zoomTo(node);
  }

  getTranslatedPointerPosition() {
    const currMousePosition = this.stage.getPointerPosition();
    if (!currMousePosition) {
      return { x: 0, y: 0 };
    }
    return {
      x:
        (currMousePosition.x - this.stage.getPosition().x) /
        this.stage.scale().x,
      y:
        (currMousePosition.y - this.stage.getPosition().y) /
        this.stage.scale().y,
    };
  }

  annotationToRect(
    annotation: OrnateAnnotation,
    doc: OrnatePDFDocument,
    image: { width: number; height: number },
    groupId?: string
  ) {
    const rect = new Konva.Rect({
      id: annotation.id,
      x: annotation.x * image.width,
      y: annotation.y * image.height,
      width: annotation.width * image.width,
      height: annotation.height * image.height,
      stroke: annotation.stroke,
      strokeWidth: annotation.strokeWidth,
      fill: annotation.fill,
      unselectable: true,
      metadata: annotation.metadata,
      attachedToGroup: groupId,
      name: 'annotation',
      inGroup: groupId,
    });
    if (annotation.onClick) {
      rect.on('click', (e) => {
        this.currentTool.onAnnotationClick(e, rect);
        annotation.onClick!({
          instance: rect,
          annotation,
          document: doc,
        });
      });
      rect.on('mouseenter', () => {
        this.stage.container().style.cursor = 'pointer';
      });
      rect.on('mouseleave', () => {
        this.stage.container().style.cursor =
          this.currentTool?.cursor || 'default';
      });
    }
    return rect;
  }

  restart = () => {
    this.stage.destroy();
    this.isDrawing = false;
    this.documents = [];
    this.connectedLineGroup = [];
    this.init();
  };

  addDrawings = (...drawings: Drawing[]) => {
    drawings.forEach((drawing) => {
      let shape = new Konva.Shape();
      if (drawing.type === 'line') {
        shape = new Konva.Line(drawing.attrs);
      }
      if (drawing.type === 'rect') {
        shape = new Konva.Rect(drawing.attrs);
      }
      if (drawing.type === 'text') {
        shape = new Konva.Text(drawing.attrs);
      }
      if (drawing.type === 'circle') {
        shape = new Konva.Circle(drawing.attrs);
      }
      if (drawing.attrs.image) {
        shape = CommentTool.create(drawing.attrs);
      }
      if (drawing.groupId) {
        const group = this.stage.findOne<Konva.Group>(`#${drawing.groupId}`);
        if (group) {
          group.add(shape);
        }
      }
    });
  };

  removeDocument(doc: OrnatePDFDocument) {
    const fileId = doc.group.attrs.id;

    this.connectedLineGroup = this.connectedLineGroup.filter((lineGroup) => {
      if (
        lineGroup.nodeA.parent?.attrs.id === fileId ||
        lineGroup.nodeB.parent?.attrs.id === fileId
      ) {
        lineGroup.line.destroy();
        return false;
      }
      return true;
    });
    doc.group.destroy();
    doc.kImage.destroy();

    // remove annotations
    this.documents = this.documents.filter((d) => {
      return d !== doc;
    });
  }

  exportToJSON = (): OrnateJSON => {
    return {
      documents: this.documents.map((doc) => ({
        metadata: doc.metadata || {},
        x: doc.group.x(),
        y: doc.group.y(),
        drawings: (doc.group.children || []).map((x) => ({
          type: x.attrs.type,
          attrs: x.attrs,
        })),
      })),
      connectedLines: this.connectedLineGroup.map((lineGroup) => ({
        nodeA: {
          x: lineGroup.nodeA.attrs.x,
          y: lineGroup.nodeA.attrs.y,
          groupId: lineGroup.nodeA.parent?.attrs.id,
          metadata: lineGroup.nodeA.attrs.metadata,
        },
        nodeB: {
          x: lineGroup.nodeB.attrs.x,
          y: lineGroup.nodeB.attrs.y,
          groupId: lineGroup.nodeB.parent?.attrs.id || lineGroup.nodeB.attrs.id,
          metadata: lineGroup.nodeB.attrs.metadata,
        },
      })),
    };
  };

  onExport = async (fileName = 'WorkSpace') => {
    const pdf = await PDFDocument.create();

    // To do: instead of getting the PIDs from the canvas,
    // get the original PID and draw the annotations on the original ones.
    const annotatedPIDs = this.documents.map(async (doc) => {
      const tempPrevScale = this.stage.scale();
      this.stage.scale({ x: 1, y: 1 });
      const dataURL = doc.group.toDataURL();
      this.stage.scale(tempPrevScale);

      const layer = await pdf.embedPng(dataURL);
      const page = pdf.addPage([doc.kImage.width(), doc.kImage.height()]);

      page.drawImage(layer, {
        x: 0,
        y: 0,
        width: doc.kImage.width(),
        height: doc.kImage.height(),
      });
    });

    await Promise.all(annotatedPIDs);

    const pdfBytes = await pdf.saveAsBase64({ dataUri: true });

    // To do: replace the file name with the workspace name
    downloadURL(pdfBytes, `${fileName}.pdf`);
  };
}
