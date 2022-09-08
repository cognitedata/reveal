import { createHash } from 'crypto';

import {
  bothSymbolTypes,
  DiagramLineInstanceOutputFormat,
  DiagramSymbol,
  GraphDocument,
  PidFileConnectionInstance,
  Rect,
  SvgRepresentation,
} from '..';

/**
 * PostGIS geometry JSON, see http://postgis.net/workshops/postgis-intro/geometries.html
 * Current implementation is limited to a LINESTRING with 2 points
 */
export interface PostGisGeometry {
  /** Type for the PostGIS object */
  type: 'LineString';
  /** Coordinates for the PostGIS object */
  coordinates: [[number, number], [number, number]];
}

/** Helper class to transform PostGisGeometry from and into different representations */
export abstract class PostGisGeometryAdapter {
  /** Convert PostGIS JSON representation into string representation */
  public static toString(pgGeom: PostGisGeometry): string {
    return `LINESTRING(${pgGeom.coordinates[0][0]} ${pgGeom.coordinates[0][1]}, ${pgGeom.coordinates[1][0]} ${pgGeom.coordinates[1][1]})`;
  }

  /** Parse PostGIS string into JSON representation */
  public static fromString(postGisString: string): PostGisGeometry {
    // Currently DMS accepts crazy formatting for PostGIS strings
    // including tabs and newlines. This is a best effort implementation
    // assuming that the string is well-formatted.
    const matches = /LINESTRING\((\S+)\s+(\S+),\s*(\S+)\s+(\S+)\)/g.exec(
      postGisString
    );
    if (matches === null || matches.length !== 5) {
      throw Error(`Malformatted PostGIS string: ${postGisString}`);
    }
    const [x1, y1, x2, y2] = matches.slice(1).map((match) => {
      const num = Number(match);
      if (Number.isNaN(num)) {
        throw Error(`Malformatted PostGIS string: ${postGisString}`);
      }
      return num;
    });
    return {
      type: 'LineString',
      coordinates: [
        [x1, y1],
        [x2, y2],
      ],
    };
  }

  /**
   * Transform a rectangle into a "LineString" with two points representing
   * the lower left and upper right corner */
  public static fromRect(rect: Rect): PostGisGeometry {
    return {
      type: 'LineString',
      coordinates: [
        [rect.x, rect.y],
        [rect.x + rect.width, rect.y + rect.height],
      ],
    };
  }
}

interface DmsModel {
  /** external id for this model */
  externalId: string;
}

// ----- Nodes -----
export type ModelNodeMap = {
  node: DmsNode;
  FilePageMixin: FilePageMixin;
  Viewbox: ViewboxNode;
  DiagramNode: DiagramNode;
  Instance: InstanceNode;
  Symbol: SymbolNode;
  FileConnection: FileConnectionNode;
  SymbolTemplate: SymbolTemplateNode;
  Line: LineNode;
};

export interface DmsNode extends DmsModel {
  modelName: 'node';
}

export interface FilePageMixin extends Omit<DmsNode, 'modelName'> {
  modelName: 'FilePageMixin';
  /** id of the labeled SVG file in CDF */
  fileId: number;
  /** page on the file */
  filePage: number;
}

export interface ViewboxNode extends Omit<FilePageMixin, 'modelName'> {
  modelName: 'Viewbox';
  /** The rectangular box formated as PostGIS type http://postgis.net/workshops/postgis-intro/geometries.html
   * Since boxes are not available, we are using LINESTRING(x1 y1, x2 y2) to state the lower left and upper right corner.
   */
  box: PostGisGeometry;
}
export abstract class ViewboxNodeAdapter {
  public static fromRect(
    rect: Rect,
    fpInfo: Omit<FilePageMixin, 'modelName'>
  ): ViewboxNode {
    return {
      ...fpInfo,
      modelName: 'Viewbox',
      box: PostGisGeometryAdapter.fromRect(rect),
    };
  }
}

export interface DiagramNode extends Omit<FilePageMixin, 'modelName'> {
  modelName: 'DiagramNode';
  /** ids of the svg paths for the symbol template */
  svgPathCommands: string[];
  /** svg styles of the paths for the symbol template */
  svgPathStyles: string[];
  /** geometric representation. Can be any PostGIS type: http://postgis.net/workshops/postgis-intro/geometries.html */
  geometry: PostGisGeometry;
}

// --- Symbol Instance Nodes ---
export interface InstanceNode extends Omit<DiagramNode, 'modelName'> {
  modelName: 'Instance';
  /** Concrete ids of svg paths in the referenced file */
  svgPathIds: string[];
  /** Optional reference to a CDF asset by id */
  assetId?: number;
  /** Optional reference to a CDF asset by name */
  assetName?: string;
}

const dmsSupportedSymbolTypes = [
  ...bothSymbolTypes,
  'File Connection',
] as const;
type DmsSupportedSymbolTypes = typeof dmsSupportedSymbolTypes[number];
export interface SymbolNode extends Omit<InstanceNode, 'modelName'> {
  modelName: 'Symbol';
  /** The name of the symbol type inside the parser tool */
  symbolType: DmsSupportedSymbolTypes;
  /** Rotation of the symbol relative to the symbol template in degrees */
  rotation: number;
  /** Scale of the symbol relative to the symbol template */
  scale: number;
}

export interface FileConnectionNode extends Omit<SymbolNode, 'modelName'> {
  modelName: 'FileConnection';
  symbolType: 'File Connection';
  /** direction in degrees this file connection is pointing to */
  direction: number;
  /** string describing whether or not the file connection is pointing outwards of the current file */
  fileDirection: string;
}

function svgRepresentationToCommandsAndStyles(
  svgRepresentation: SvgRepresentation
): {
  svgPathCommands: string[];
  svgPathStyles: string[];
} {
  // flatten the svgPath structure into two arrays
  const svgPathCommands: string[] = [];
  const svgPathStyles: string[] = [];
  svgRepresentation.svgPaths.forEach((svgPath) => {
    svgPathCommands.push(svgPath.svgCommands);
    svgPathStyles.push(svgPath.style!);
  });
  return { svgPathCommands, svgPathStyles };
}

/** Create a deterministic sha1 hash from an object. This is used to create
 * unique but deterministic externalIDs for Nodes and Edges
 */
function externalIdFromObjectHash(obj: any): string {
  const hash = createHash('sha1').update(JSON.stringify(obj)).digest('hex');
  return hash;
}

// --- Symbol Template ---
export interface SymbolTemplateNode extends Omit<DiagramNode, 'modelName'> {
  modelName: 'SymbolTemplate';
  /** Human readable description */
  description: string;
}
export abstract class SymbolTemplateNodeAdapter {
  public static fromDiagramSymbol(
    diagramSymbol: DiagramSymbol,
    fpInfo: Omit<FilePageMixin, 'modelName'>
  ): SymbolTemplateNode {
    return {
      modelName: 'SymbolTemplate',
      ...fpInfo,
      ...svgRepresentationToCommandsAndStyles(diagramSymbol.svgRepresentation),
      geometry: PostGisGeometryAdapter.fromRect(
        diagramSymbol.svgRepresentation.boundingBox
      ),
      description: diagramSymbol.description,
    };
  }
}

type LineType = 'Process';
export interface LineNode extends Omit<InstanceNode, 'modelName'> {
  modelName: 'Line';
  /** Subtype of the line, e.g. what type of connection the line represents */
  lineType: LineType;
  /** Whether or not the line has a direction. Should be treated as a bool even though it is a number, as DMS does not know bools. */
  isDirected: number;
}
export abstract class LineNodeAdapter {
  public static fromDiagramLineInstance(
    diagramLineInstance: DiagramLineInstanceOutputFormat,
    fpInfo: Omit<FilePageMixin, 'modelName'>
  ): LineNode {
    return {
      modelName: 'Line',
      lineType: 'Process',
      ...fpInfo,
      ...svgRepresentationToCommandsAndStyles(
        diagramLineInstance.svgRepresentation
      ),
      svgPathIds: diagramLineInstance.pathIds,
      geometry: PostGisGeometryAdapter.fromRect(
        diagramLineInstance.svgRepresentation.boundingBox
      ),
      isDirected: 0,
    };
  }
}

// ----- Edges -----
export type ModelEdgeMap = {
  edge: DmsEdge;
  BaseEdge: BaseEdge;
  InstanceEdge: InstanceEdge;
  FileLink: FileLinkEdge;
};

export interface DmsEdge extends DmsModel {
  modelName: 'edge';
  type: string;
  startNode: string;
  endNode: string;
}

export interface BaseEdge extends Omit<DmsEdge, 'modelName'> {
  modelName: 'BaseEdge';
  /** The confidence between from 0.0 to 1.0 for the link between two instances is correct */
  confidence?: number;
}

export interface InstanceEdge extends Omit<BaseEdge, 'modelName'> {
  modelName: 'InstanceEdge';
  /** id of the labeled SVG file in CDF */
  fileId: number;
  /** page on the file */
  filePage: number;
}

export interface FileLinkEdge extends Omit<BaseEdge, 'modelName'> {
  modelName: 'FileLink';
}

/**
 * Create the graph topology of nodes and edges with all symbols,
 * lines, and the edges connecting them. Takes the corresponding objects
 * from the GraphDocument as an input
 * @param options Object containing the GraphDocument to convert as well as the fileId and filePage
 * @param fileId CDF id for the file
 * @param filePage page number on the file
 * @returns Object containing lists of all created nodes and edges, keyed by model name
 */
export function graphDocumentToNodesAndEdges(options: {
  graphDocument: GraphDocument;
  fileId: number;
  filePage: number;
}): {
  nodes: {
    Viewbox: ViewboxNode[];
    Symbol: SymbolNode[];
    FileConnection: FileConnectionNode[];
    Line: LineNode[];
  };
  edges: {
    InstanceEdge: InstanceEdge[];
  };
} {
  // Used to avoid creating the same node twice when multiple identical instances occur in the GraphDocument
  const instanceDeduplicator = new Set<string>();

  const filePageInfo = {
    fileId: options.fileId,
    filePage: options.filePage,
  };

  // Create the viewbox with unique externalId
  const viewboxNode = ViewboxNodeAdapter.fromRect(
    options.graphDocument.viewBox,
    {
      externalId: `viewbox_${externalIdFromObjectHash({
        ...options.graphDocument.viewBox,
        ...filePageInfo,
      })}`,
      ...filePageInfo,
    }
  );

  // Create symbol nodes from diagramSymbolInstances
  // While doing this, map diagramSymbolInstance.id to the created NodeType and externalId in order
  // to later create edges from DiagramConnections
  const idToExternalIdMap = new Map<
    string,
    ['Symbol' | 'FileConnection' | 'Line', string]
  >();
  const symbolNodes: SymbolNode[] = [];
  const fileConnectionNodes: FileConnectionNode[] = [];
  options.graphDocument.symbolInstances.forEach((diagramSymbolInstance) => {
    // Construct externalId
    const externalIdHash = `${externalIdFromObjectHash({
      ...diagramSymbolInstance,
      ...filePageInfo,
    })}`;
    // Deal with potential duplicate instances
    if (instanceDeduplicator.has(externalIdHash)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Ignoring duplicate diagramSymbolInstance with hash: ${externalIdHash}`
      );
      return;
    }
    instanceDeduplicator.add(externalIdHash);

    // object with all the common fields, except externalId and modelName
    const symbolNodePrecursor = {
      ...filePageInfo,
      ...svgRepresentationToCommandsAndStyles(
        diagramSymbolInstance.svgRepresentation
      ),
      geometry: PostGisGeometryAdapter.fromRect(
        diagramSymbolInstance.svgRepresentation.boundingBox
      ),
      svgPathIds: diagramSymbolInstance.pathIds,
      rotation: diagramSymbolInstance.rotation,
      scale: diagramSymbolInstance.scale,
      assetId: diagramSymbolInstance.assetId,
      assetName: diagramSymbolInstance.assetName,
    };

    if (diagramSymbolInstance.type === 'File Connection') {
      // Create a FileConnectionNode
      const fileConnectionNode: FileConnectionNode = {
        symbolType: 'File Connection',
        modelName: 'FileConnection',
        ...symbolNodePrecursor,
        direction: diagramSymbolInstance.direction!,
        fileDirection: (diagramSymbolInstance as PidFileConnectionInstance)
          .fileDirection!,
        externalId: `fileConn_${externalIdHash}`,
      };
      idToExternalIdMap.set(diagramSymbolInstance.id, [
        fileConnectionNode.modelName,
        fileConnectionNode.externalId,
      ]);
      fileConnectionNodes.push(fileConnectionNode);
    } else if (
      dmsSupportedSymbolTypes.includes(
        diagramSymbolInstance.type as DmsSupportedSymbolTypes
      )
    ) {
      // Create a SymbolNode
      const symbolNode: SymbolNode = {
        symbolType: diagramSymbolInstance.type as DmsSupportedSymbolTypes,
        modelName: 'Symbol',
        ...symbolNodePrecursor,
        externalId: `symbol_${externalIdHash}`,
      };
      idToExternalIdMap.set(diagramSymbolInstance.id, [
        symbolNode.modelName,
        symbolNode.externalId,
      ]);
      symbolNodes.push(symbolNode);
    } else {
      // Unsupported type of DiagramSymbolInstance
      throw Error(
        `Unsupported type of SymbolInstance: ${diagramSymbolInstance.type}`
      );
    }
  });

  // Create line nodes from DiagramLineInstances and add them to the id to externalId map as well
  const lineNodes: LineNode[] = [];
  options.graphDocument.lines.forEach((diagramLineInstance) => {
    // Construct externalId
    const externalIdHash = `${externalIdFromObjectHash({
      ...diagramLineInstance,
      ...filePageInfo,
    })}`;
    // Deal with potential duplicate instances
    if (instanceDeduplicator.has(externalIdHash)) {
      // eslint-disable-next-line no-console
      console.warn(
        `Ignoring duplicate diagramLineInstance with hash: ${externalIdHash}`
      );
      return;
    }
    instanceDeduplicator.add(externalIdHash);

    // Construct lineNodes with unique externalId
    const lineNode = LineNodeAdapter.fromDiagramLineInstance(
      diagramLineInstance,
      {
        externalId: `line_${externalIdHash}`,
        ...filePageInfo,
      }
    );
    lineNodes.push(lineNode);
    // Map diagramLineInstance.id to externalId
    idToExternalIdMap.set(diagramLineInstance.id, [
      lineNode.modelName,
      lineNode.externalId,
    ]);
  });

  // Create edges from DiagramConnections, using the mapping of id to externalId
  const instanceEdges: InstanceEdge[] = [];
  options.graphDocument.connections.forEach((diagramConnection) => {
    const startInfo = idToExternalIdMap.get(diagramConnection.start);
    const endInfo = idToExternalIdMap.get(diagramConnection.end);
    if (startInfo === undefined || endInfo === undefined) {
      throw Error(
        `No corresponding start node or end node for connection ${diagramConnection}`
      );
    }
    const [startModel, startNode] = startInfo;
    const [endModel, endNode] = endInfo;
    const externalIdHash = `${externalIdFromObjectHash({
      ...diagramConnection,
      ...filePageInfo,
    })}`;

    instanceEdges.push({
      modelName: 'InstanceEdge',
      fileId: options.fileId,
      filePage: options.filePage,
      type: `${startModel}-${endModel}`,
      startNode,
      endNode,
      externalId: `instanceEdge_${externalIdHash}`,
    });
  });

  return {
    nodes: {
      Viewbox: [viewboxNode],
      Symbol: symbolNodes,
      FileConnection: fileConnectionNodes,
      Line: lineNodes,
    },
    edges: {
      InstanceEdge: instanceEdges,
    },
  };
}
