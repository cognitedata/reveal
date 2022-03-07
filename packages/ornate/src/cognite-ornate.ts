import Konva from 'konva';
import { KonvaEventObject, Node, NodeConfig } from 'konva/lib/Node';
import { Shape, ShapeConfig } from 'konva/lib/Shape';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import { v4 as uuid } from 'uuid';
import { Vector2d } from 'konva/lib/types';
import { PDFDocument } from 'pdf-lib';
import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';

import { OrnateHistory, UpdateKeyType } from './containers/History';
import { OrnateTransformer } from './containers/Transformer';
import CircleMarker from './shapes/CircleMarker';
import Squiggle from './shapes/Squiggle';
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
import getInputDeviceFromWheelEvent from './utils/getInputDeviceFromWheelEvent';
import InputDevice from './utils/InputDevice';
import isNodeInView from './utils/isNodeInView';

const OUT_OF_VIEW_DETECTION_DEBOUNCE_MS = 250;
const RIGHT_MOUSE_BUTTON = 2;

const defaultShapeSettings = {
  circle: { strokeWidth: 10, stroke: 'rgba(255,220,127,1)' },
  line: { strokeWidth: 10, stroke: 'rgba(255,220,127,1)' },
  rect: { strokeWidth: 10, stroke: 'rgba(255,220,127,1)' },
  squiggle: { strokeWidth: 10, stroke: 'rgba(255,220,127,1)' },
  text: { fill: 'rgba(255,220,127,1)', fontSize: 32 },
};

const sceneBaseWidth = window.innerWidth * 2;
const sceneBaseHeight = window.innerHeight * 2;

const SCALE_SENSITIVITY = 0.96;
const SCALE_MAX = 5;
const SCALE_MIN = 0.05;

type ZoomToGroupOptions = {
  duration?: number;
  scaleFactor?: number;
  relativeTo?: Konva.Container;
};

export type CogniteOrnateOptions = {
  container: string;
};

const getShapeByDrawing = (drawing: Drawing) => {
  if (drawing.type === 'path') {
    return new Konva.Path({
      ...drawing.attrs,
      id: drawing.id,
    });
  }

  if (drawing.type === 'arrow') {
    return new Konva.Arrow({
      ...drawing.attrs,
      id: drawing.id,
    });
  }

  if (drawing.type === 'line') {
    return new Konva.Line({ ...drawing.attrs, id: drawing.id });
  }

  if (drawing.type === 'circleMarker') {
    return new CircleMarker({ ...drawing.attrs, id: drawing.id });
  }

  if (drawing.type === 'squiggle') {
    return new Squiggle({ ...drawing.attrs, id: drawing.id });
  }

  if (drawing.type === 'rect') {
    return new Konva.Rect({ ...drawing.attrs, id: drawing.id });
  }

  if (drawing.type === 'text') {
    return new Konva.Text({ ...drawing.attrs, id: drawing.id });
  }

  if (drawing.type === 'circle') {
    return new Konva.Circle({ ...drawing.attrs, id: drawing.id });
  }

  if (drawing.type === 'stamp' && drawing.attrs.url) {
    // Make sure we do not pass an image in to begin with - it wont be valid
    const shape = new Konva.Image({ ...drawing.attrs, image: undefined });

    const imageObj = new Image();
    imageObj.onload = () => {
      (shape as Konva.Image).image(imageObj);
    };
    imageObj.src = drawing.attrs.url;
    return shape;
  }

  if (drawing.type === 'comment') {
    // attrs contains the id for comments
    return CommentTool.create({ ...drawing.attrs });
  }

  throw new Error(`Drawing referenced unsupported shape: ${drawing.type}`);
};

export const getGroupById = (id: string, stage: Konva.Stage) => {
  const group = stage.findOne<Konva.Group>(`#${id}`);
  if (!group) {
    throw new Error(`No group with id ${id} was found`);
  }
  return group;
};

export class CogniteOrnate {
  host: HTMLDivElement;
  documents: OrnatePDFDocument[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  stage: Konva.Stage;
  backgroundLayer: Konva.Layer = new Konva.Layer({
    name: 'backgroundLayer',
  });
  baseLayer: Konva.Layer = new Konva.Layer({
    name: 'baseLayer',
  });
  history: OrnateHistory = new OrnateHistory([], []);
  isDrawing = false;
  currentTool: Tool = new DefaultTool(this);
  connectedLineGroup: ConnectedLine[] = [];
  shapeSettings: ShapeSettings = defaultShapeSettings;
  transformer: OrnateTransformer | undefined;
  tools: Record<string, Tool> = {};
  resizeObserver?: ResizeObserver;
  mouseOverGroup?: Konva.Group;

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

    const stageContainer = this.stage.container();
    // make it focusable
    stageContainer.tabIndex = 1;

    // Add layers to stage
    this.stage.add(this.backgroundLayer);
    this.stage.add(this.baseLayer);

    // Initialise mouse events
    this.stage.on('mousedown', this.onStageMouseDown);
    this.stage.on('mousemove', this.onStageMouseMove);
    this.stage.on('mouseup', this.onStageMouseUp);
    this.stage.on('wheel', this.onStageMouseWheel);
    this.stage.on('mouseover', this.onStageMouseOver);
    this.stage.on('contextmenu', this.onStageContextMenu);
    this.stage.on('mouseenter', this.onStageMouseEnter);
    this.currentTool.onInit();

    // Ensure responsiveness
    this.fitStageIntoParentContainer();
    const throttledResizeHandler = throttle(() => {
      this.fitStageIntoParentContainer();
    }, 25);
    this.resizeObserver = new ResizeObserver(throttledResizeHandler);
    this.resizeObserver.observe(this.host);
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

  /**
   * Function which creates the shape, as well as keeps track of it so it can be undone. Currently can be used with line, circle, rect and text.
   */
  addShape = (shape: Shape<ShapeConfig>) => {
    if (shape === null) return;
    const groupName = shape.attrs?.attachedToGroup || shape.attrs?.inGroup;
    const group = this.stage.findOne(`#${groupName}`) as Konva.Group;
    const layer: Konva.Layer | Konva.Group = group || this.baseLayer;
    this.history.addShape(shape);
    layer.add(shape);
    if (!group) {
      this.baseLayer.draw();
    }
  };

  /**
   * Function which updates the selected shape settings as well as keeps the previous value for the Undo functionality
   */
  updateShape = (
    selectedShape: Node<NodeConfig> | null,
    updatedKey: UpdateKeyType,
    updatedValue: string | number
  ) => {
    if (selectedShape === null) return;
    this.history.updateShape(selectedShape, updatedKey);
    selectedShape.setAttr(updatedKey, updatedValue);
  };

  /**
   * Function which destroys the shape, as well as keeps track of it so it can be undone. Currently can be used with line, circle, rect and text.
   */
  destroyShape = (selectedShape: Node<NodeConfig> | null) => {
    if (selectedShape === null) return;
    this.history.destroyShape(selectedShape);
    selectedShape.destroy();
    this.transformer?.setSelectedNodes([]);
  };

  /**
   *
   * @param {string | PDFDocumentProxy} pdfFile The document scr or document itself
   */
  addPDFDocument = async (
    pdfFile: string | PDFDocumentProxy,
    pageNumber: number,
    metadata: Record<string, string>,
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
      groupId?: string;
      width?: number;
      height?: number;
      shouldCenterOnDoubleClick?: boolean;
    }
  ): Promise<OrnatePDFDocument> => {
    const {
      initialPosition = { x: 0, y: 0 },
      zoomAfterLoad = true,
      groupId = uuid(),
      shouldCenterOnDoubleClick = true,
    } = options || {};
    const { data: base64, pdf } = await pdfToImage(pdfFile, pageNumber);
    return new Promise<OrnatePDFDocument>((res, rej) => {
      const group = new Konva.Group({
        id: groupId,
        PDFCurrentPage: pageNumber,
        PDFMaxPages: pdf.numPages,
      });
      this.baseLayer.add(group);
      const image = new Image(options?.width, options?.height);
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
          attachedToGroup: group.id(),
        });
        group.add(baseRect);
        baseRect.zIndex(0);

        if (shouldCenterOnDoubleClick) {
          group.on('dblclick', () => {
            this.zoomToNode(group);
          });
        }

        this.baseLayer.draw();
        if (zoomAfterLoad) {
          this.zoomToNode(group, 0);
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
    if (e.evt.button === RIGHT_MOUSE_BUTTON) {
      this.stage.startDrag();
      return;
    }

    if (this.currentTool?.onMouseDown) {
      this.currentTool.onMouseDown(e);
    }
  };

  onStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    this.setCursor(
      e.target.eventListeners.click === undefined &&
        e.target.eventListeners.dblclick === undefined
        ? this.currentTool.cursor
        : 'pointer'
    );

    if (this.currentTool?.onMouseMove) {
      this.currentTool.onMouseMove(e);
    }
  };

  onStageMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === RIGHT_MOUSE_BUTTON) {
      this.stage.stopDrag();
      return;
    }

    if (this.currentTool?.onMouseUp) {
      this.currentTool.onMouseUp(e);
    }
    this.connectedLineGroup.forEach((l) => l.update());
  };

  onStageMouseOver = (e: KonvaEventObject<MouseEvent>) => {
    if (this.currentTool.onMouseOver) {
      this.currentTool.onMouseOver(e);
    }
  };

  onStageMouseWheel = (
    e: KonvaEventObject<WheelEvent & { wheelDeltaY?: number }>
  ) => {
    e.evt.preventDefault();
    if (
      e.evt.ctrlKey ||
      getInputDeviceFromWheelEvent(e.evt) === InputDevice.MOUSE
    ) {
      this.onZoom(e.evt.deltaY, true);
      return;
    }

    const dx = e.evt.deltaX;
    const dy = e.evt.deltaY;

    const x = this.stage.x() - dx;
    const y = this.stage.y() - dy;

    this.stage.x(x);
    this.stage.y(y);
    this.onViewportChange();
  };

  onStageContextMenu = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.preventDefault();
  };

  onStageMouseEnter = () => {
    this.stage.container().style.cursor = this.currentTool?.cursor;

    if (this.stage.isDragging()) {
      this.stage.stopDrag();
    }
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
    this.onViewportChange();
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

  /**
   * Zoom to the given location
   * @param location specifies the center of the location to zoom to
   * @param scale
   * @param duration
   */
  zoomToLocation(
    location: { x: number; y: number },
    scale: number,
    duration = 0.35
  ) {
    const deltaX = this.stage.width() / 2;
    const deltaY = this.stage.height() / 2;
    const x = scale * location.x + deltaX;
    const y = scale * location.y + deltaY;
    const tween = new Konva.Tween({
      duration,
      easing: Konva.Easings.EaseInOut,
      node: this.stage,
      scaleX: scale,
      scaleY: scale,
      x,
      y,
    });
    tween.onFinish = () => {
      tween.destroy();
      this.onViewportChange();
    };

    tween.play();
  }

  zoomToGroup(group: Konva.Group, zoomToGroupOptions?: ZoomToGroupOptions) {
    // Remove Konva.Transformer from the group to get a precise clientRect values.
    this.transformer?.remove();
    const ZOOM_TO_GROUP_OPTIONS_DEFAULTS = { duration: 0.35, scaleFactor: 1 };
    const { duration, scaleFactor, relativeTo } = {
      ...ZOOM_TO_GROUP_OPTIONS_DEFAULTS,
      ...zoomToGroupOptions,
    };
    const { width: groupWidth, height: groupHeight } = group.getClientRect({
      skipTransform: true,
      skipStroke: true,
      relativeTo,
    });
    const rawScale =
      Math.min(
        this.stage.width() / groupWidth,
        this.stage.height() / groupHeight
      ) * scaleFactor;
    const scale = Math.min(Math.max(rawScale, SCALE_MIN), SCALE_MAX);
    const location = {
      x: -group.x() - groupWidth / 2,
      y: -group.y() - groupHeight / 2,
    };

    this.zoomToLocation(location, scale, duration);
    // Add the transformer back into the group.
    if (this.transformer) {
      this.baseLayer.add(this.transformer);
    }
  }

  zoomToNode(node: Konva.Node, duration = 0.35) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - relativeTo DOES accept this.stage just fine.
    const rect = node.getClientRect({ relativeTo: this.stage });
    const rawScale = Math.min(
      this.stage.width() / rect.width,
      this.stage.height() / rect.height
    );

    const scale = Math.min(Math.max(rawScale, SCALE_MIN), SCALE_MAX);

    // Scale the location
    const location = {
      x: -rect.x - node.width() / 2,
      y: -rect.y - node.height() / 2,
    };
    this.zoomToLocation(location, scale, duration);
  }

  zoomToDocument(doc: OrnatePDFDocument) {
    // get layers
    const node = doc.group;
    this.zoomToNode(node);
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
      cornerRadius: annotation.cornerRadius,
      dash: annotation.dash,
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
    }
    return rect;
  }

  restart = () => {
    this.stage.destroy();
    this.isDrawing = false;
    this.documents = [];
    this.connectedLineGroup = [];
    this.resizeObserver?.unobserve(this.host);
    this.init();
  };

  addDrawings = (...drawings: Drawing[]) => {
    return drawings.map((drawing) => {
      const container = drawing.groupId
        ? getGroupById(drawing.groupId, this.stage)
        : this.baseLayer;
      const shape = getShapeByDrawing(drawing);
      if (drawing.onClick) {
        shape.on('click', drawing.onClick);
      }

      container.add(shape);
      return shape;
    });
  };

  removeShapeById = (id: string) => {
    const shape = this.stage.findOne(`#${id}`);
    if (!shape) {
      return;
    }

    shape.destroy();
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

  onExport = async (fileName = 'WorkSpace', documentIds?: string[]) => {
    const pdf = await PDFDocument.create();
    const documents = documentIds
      ? (documentIds.map((id) =>
          this.documents.find((doc) => doc.group.id() === id)
        ) as OrnatePDFDocument[])
      : this.documents;

    // To do: instead of getting the PIDs from the canvas,
    // get the original PID and draw the annotations on the original ones.
    const annotatedPIDs = documents.map(async (doc) => {
      const isHidden = !doc.kImage.visible();

      if (isHidden) {
        doc.kImage.show();
      }
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
      if (isHidden) {
        doc.kImage.hide();
      }
    });

    await Promise.all(annotatedPIDs);

    const pdfBytes = await pdf.saveAsBase64({ dataUri: true });

    // To do: replace the file name with the workspace name
    downloadURL(pdfBytes, `${fileName}.pdf`);
  };

  getCursor = (): string => this.stage.container().style.cursor;

  setCursor = (cursor: string): void => {
    this.stage.container().style.cursor = cursor;
  };

  onViewportChange = debounce(() => {
    this.documents.forEach((doc) => {
      const shouldShowImagesAtScale =
        this.stage.scaleX() > 0.1 || this.stage.scaleY() > 0.1;
      if (shouldShowImagesAtScale && isNodeInView(doc.group, this.stage)) {
        doc.kImage.show();
      } else {
        doc.kImage.hide();
      }
    });
  }, OUT_OF_VIEW_DETECTION_DEBOUNCE_MS);
}
