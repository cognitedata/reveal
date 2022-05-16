import Konva from 'konva';
import throttle from 'lodash/throttle';
import { PDFDocument } from 'pdf-lib';

import { OrnateTransformer } from './ornate-transformer';
import { OrnateInteractions } from './ornate-interactions';
import {
  Tool,
  ToolNodeStyle,
  ToolType,
  SelectTool,
  HandTool,
  CircleTool,
  RectTool,
  LineTool,
  TextTool,
  StampTool,
  ListTool,
} from './tools';
import {
  OrnateFileURLConfig,
  OrnateShapeConfig,
  Shape,
  toKonva,
} from './shapes';
import { renderBackgroundIntoLayer } from './utils/background';
import { defaultColor } from './utils/colors';
import { downloadURL } from './utils/download-url';
import { PathTool } from './tools/path-tool';

export type CogniteOrnateOptions = {
  container: string;
  layers?: Record<string, Konva.Layer>;
  defaultTool?: ToolType;
};

export type OrnateShapeObject = {
  attrs: OrnateShapeConfig;
  className: string;
  children: OrnateShapeObject[];
};

export type OrnateExport = OrnateShapeObject[];

export type OrnateZoomOptions = {
  scale?: number;
  duration?: number;
};

export class CogniteOrnate {
  public constants = {
    SCALE_MAX: 5,
    SCALE_MIN: 0.05,
    SCALE_SENSITIVITY: 0.96,
    MOUSE_WHEEL_SCALE_FACTOR: -0.00028,
    TOUCHPAD_SCALE_FACTOR: -0.006,
    SCALE_DELTA_MAX: 0.13,
    TOUCHPAD_PAN_FACTOR: 0.75,
    TOUCHPAD_PAN_DELTA_MAX: 100,
  };
  public host: HTMLDivElement;
  public stage: Konva.Stage;
  private resizeObserver: ResizeObserver;
  public interactionHandler: OrnateInteractions;
  public activeTool?: Tool;
  public layers: Record<string, Konva.Layer> = {
    background: new Konva.Layer({ name: 'backgroundLayer' }),
    main: new Konva.Layer({ name: 'mainLayer' }),
    top: new Konva.Layer({ name: 'topLayer' }),
  };
  public style: ToolNodeStyle = {
    fill: defaultColor.rgb().string(),
    stroke: defaultColor.alpha(1).rgb().string(),
    strokeWidth: 12,
    fontSize: '18',
  };
  public tools = {
    HAND: new HandTool(this),
    SELECT: new SelectTool(this),
    CIRCLE: new CircleTool(this),
    RECT: new RectTool(this),
    LINE: new LineTool(this),
    TEXT: new TextTool(this),
    PATH: new PathTool(this),
    STAMP: new StampTool(this),
    LIST: new ListTool(this),
  } as const;
  public groups: Record<string, Konva.Group> = {};
  public previousTool: Tool | undefined;
  public transformer: OrnateTransformer;

  /**
   * Initialise an instance of Cognite Ornate
   * @param options Several initialisation options
   */
  constructor(options: CogniteOrnateOptions) {
    const host = document.querySelector(options.container) as HTMLDivElement;
    this.layers = { ...this.layers, ...(options.layers || {}) };
    if (!host) {
      // eslint-disable-next-line no-console
      throw new Error('ORNATE: Failed to get HTML element to attach to');
    }
    this.host = host;

    // Setup stage
    this.stage = new Konva.Stage({
      container: this.host,
      width: host.clientWidth,
      height: host.clientHeight,
      scale: { x: 1, y: 1 },
    });
    this.stage.container().tabIndex = 1; // Focusable

    // Add background layer
    renderBackgroundIntoLayer(this.layers.background);

    // Make responsive
    this.fitStageIntoParentContainer();
    const throttledResizeHandler = throttle(() => {
      this.fitStageIntoParentContainer();
    }, 25);
    this.resizeObserver = new ResizeObserver(throttledResizeHandler);
    this.resizeObserver.observe(this.host);

    // Add layers to stage
    const layers = Object.values(this.layers);
    layers.forEach((layer) => {
      this.stage.add(layer);
    });

    // Initialize mouse events
    this.interactionHandler = new OrnateInteractions(this);

    this.transformer = new OrnateTransformer(this);
    this.layers.top.add(this.transformer);

    this.activeTool = this.tools[options.defaultTool || 'HAND'];
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && this.activeTool?.name !== 'HAND') {
        this.previousTool = this.activeTool;
        this.activeTool = this.tools.HAND;
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === ' ') {
        this.activeTool = this.previousTool;
        this.previousTool = undefined;
      }
    });
  }

  /**
   * Sets the currently active tool
   */
  setActiveTool = (tool: ToolType) => {
    if (this.activeTool?.onDestroy) {
      this.activeTool.onDestroy();
    }
    this.activeTool = this.tools[tool];
  };
  /**
   * Resizes stage to fit the container its in
   */
  fitStageIntoParentContainer = () => {
    const containerWidth = this.host.parentElement!.offsetWidth;
    const containerHeight = this.host.parentElement!.offsetHeight;

    this.stage.width(containerWidth);
    this.stage.height(containerHeight);
  };

  /**
   * Adds any shape to the shape canvas
   *
   * @example
   * ornate.add(new Ornate.Rect(), new Ornate.Shape())
   *
   * @param shapes Shapes to add to the canvas
   * @param layer Layer to add shapes tp
   */
  public addShape(shapes: Shape<OrnateShapeConfig>[], layer = 'main') {
    if (shapes.length === 0) return;
    const nodes = shapes.map((shape) => shape.shape);
    const selectedLayer = this.layers[layer];
    if (!selectedLayer) {
      throw new Error(`Layer ${layer} does not exist`);
    }

    nodes.forEach((node) => {
      const { groupId } = node.attrs;
      if (groupId) {
        if (!this.groups?.[groupId]) {
          this.groups[groupId] = new Konva.Group({
            id: groupId,
            type: 'GROUP',
          });
          selectedLayer.add(this.groups[groupId]);
        }
        this.groups[groupId].add(node);
      } else {
        selectedLayer.add(node);
      }
    });
  }

  /**
   * Serialized the current stage and returns a data structure that can be stored in a database
   */

  public export() {
    const drawings = Object.values(this.layers)
      .map((layer) =>
        layer.children
          ?.filter((c) => !c.attrs.preventSerialize)
          .map((c) => {
            const object = c.toObject();
            if (c.attrs.type === 'FILE_URL') {
              delete object.children;
            }
            return object;
          })
      )
      .flat() as OrnateExport;
    return drawings;
  }

  /**
   * Import a saved OrnateExport object
   */
  public import(
    importData: OrnateExport,
    shapeSpecifics?: {
      fileUrl?: Partial<OrnateFileURLConfig>;
    }
  ) {
    const shapes = importData.map((d) => toKonva(d, shapeSpecifics));
    this.layers.main.add(...shapes);
  }

  /**
   * Load a saved import, clearing all previous data
   */
  public load(
    importData: OrnateExport,
    shapeSpecifics?: {
      fileUrl?: Partial<OrnateFileURLConfig>;
    }
  ) {
    this.reset();
    this.import(importData, shapeSpecifics);
  }

  /**
   * Resets all layers and reinitialised
   */
  public reset() {
    Object.values(this.layers).forEach((layer) => layer.removeChildren());
    renderBackgroundIntoLayer(this.layers.background);

    this.transformer = new OrnateTransformer(this);
    this.layers.top.add(this.transformer);
  }

  /**
   * Base zoom function to zoom the stage to the center of a set of x and y coordinates
   * @param location specifies the center of the location to zoom to
   * @param scale
   * @param duration
   */
  zoomTo(location: { x: number; y: number }, options?: OrnateZoomOptions) {
    const { duration = 0.35 } = options || {};
    let { scale = 1 } = options || {};
    const deltaX = this.stage.width() / 2;
    const deltaY = this.stage.height() / 2;
    if (Number.isNaN(scale)) {
      scale = 1;
    }
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
      this.stage.fire('zoomed');
    };

    tween.play();
  }

  /**
   * Zoom to a specific node within the stage
   * @param node which node to zoom to
   */
  zoomToNode(node: Konva.Node, options?: OrnateZoomOptions) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - relativeTo DOES accept this.stage just fine.
    const rect = node.getClientRect({ relativeTo: this.stage });
    const rawScale = Math.min(
      this.stage.width() / rect.width,
      this.stage.height() / rect.height
    );

    const scale = Math.min(
      Math.max(rawScale, this.constants.SCALE_MIN),
      this.constants.SCALE_MAX
    );

    // Scale the location
    const location = {
      x: -rect.x - rect.width / 2,
      y: -rect.y - rect.height / 2,
    };

    this.zoomTo(location, { scale, ...options });
  }

  /**
   * Zoom to a node with a specific ID
   * @param id id of shape to zoom to
   */
  zoomToID(id: string, options?: OrnateZoomOptions) {
    const node = this.stage.findOne(`#${id}`);
    if (!node) {
      // eslint-disable-next-line no-console
      console.warn(
        `Tried zooming to ${id} but could not find node with this ID`
      );
      return;
    }
    this.zoomToNode(node, options);
  }

  /**
   * Download files currently existing inside of the workspace
   */
  download = async (fileName = 'document') => {
    const pdf = await PDFDocument.create();
    const documentNodes = this.layers.main.find('.FILE_URL');

    const annotatedPIDs = documentNodes.map(async (node) => {
      const tempPrevScale = this.stage.scale();
      this.stage.scale({ x: 1, y: 1 });
      this.stage.scale(tempPrevScale);
      const dataURL = this.stage.toDataURL({
        x: node.x(),
        y: node.y(),
        width: node.width(),
        height: node.height(),
      });
      const layer = await pdf.embedPng(dataURL);
      const page = pdf.addPage([node.width(), node.height()]);

      page.drawImage(layer, {
        x: 0,
        y: 0,
        width: node.width(),
        height: node.height(),
      });
    });

    await Promise.all(annotatedPIDs);

    const pdfBytes = await pdf.saveAsBase64({ dataUri: true });

    // To do: replace the file name with the workspace name
    downloadURL(pdfBytes, `${fileName}.pdf`);
  };

  SAVE_EVENT = 'save-event';
  /**
   * Emits a save request
   */
  emitSaveEvent() {
    this.stage.fire(this.SAVE_EVENT);
  }
}
