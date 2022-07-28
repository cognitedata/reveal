import { DiagramSymbol, Rect } from '..';

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

/** This interface enables us to call static method and members through generics */
export interface NodeAdapter<N extends DmsNode> {
  /** The corresponding name of this Node Type in DMS */
  modelName: string;

  // NodeAdapter must allow to convert back and forth from the upsert format
  /** Tranform given node node into the upsert data format */
  sanitizeBeforeUpsert: (node: N) => any;
  /** Tranform given node from upsert format into retrieve format */
  sanitizeAfterUpsert: (node: any) => N;
}

export interface DmsNode {
  /** external id for this node */
  externalId: string;
}
export abstract class DmsNodeAdapter {
  static modelName: 'node';

  public static sanitizeBeforeUpsert(node: DmsNode): any {
    // No-Op
    return node;
  }
  public static sanitizeAfterUpsert(node: any): DmsNode {
    // No-Op
    return node;
  }
}

export interface FilePageMixin extends DmsNode {
  /** id of the labeled SVG file in CDF */
  fileId: number;
  /** page on the file */
  filePage: number;
}
export abstract class FilePageMixinAdapter {
  static modelName = 'FilePageMixin';

  public static sanitizeBeforeUpsert(node: FilePageMixin): any {
    // No-Op
    return node;
  }
  public static sanitizeAfterUpsert(node: any): FilePageMixin {
    // No-Op
    return node;
  }
}

export interface ViewboxNode extends FilePageMixin {
  /** The rectangular box formated as PostGIS type http://postgis.net/workshops/postgis-intro/geometries.html
   * Since boxes are not available, we are using LINESTRING(x1 y1, x2 y2) to state the lower left and upper right corner.
   */
  box: PostGisGeometry;
}
export abstract class ViewboxNodeAdapter {
  static modelName = 'Viewbox';

  public static fromRect(rect: Rect, fpInfo: FilePageMixin): ViewboxNode {
    return {
      ...fpInfo,
      box: PostGisGeometryAdapter.fromRect(rect),
    };
  }
  // Need to sanitize the "box", as the upsert format is a PostGIS string while the retrieval format is JSON
  public static sanitizeBeforeUpsert(node: ViewboxNode): any {
    return {
      ...node,
      box: PostGisGeometryAdapter.toString(node.box),
    };
  }
  public static sanitizeAfterUpsert(node: any): ViewboxNode {
    return {
      ...node,
      box: PostGisGeometryAdapter.fromString(node.box),
    };
  }
}

export interface DiagramNode extends FilePageMixin {
  /** ids of the svg paths for the symbol template */
  svgCommands: string[];
  /** svg styles of the paths for the symbol template */
  svgPathStyles: string[];
  /** geometric representation. Can be any PostGIS type: http://postgis.net/workshops/postgis-intro/geometries.html */
  geometry: PostGisGeometry;
}
export abstract class DiagramNodeAdapter {
  static modelName = 'DiagramNode';

  // Need to sanitize the "geometry", as the upsert format is a PostGIS string while the retrieval format is JSON
  public static sanitizeBeforeUpsert(node: DiagramNode): any {
    return {
      ...node,
      geometry: PostGisGeometryAdapter.toString(node.geometry),
    };
  }

  public static sanitizeAfterUpsert(node: any): DiagramNode {
    return {
      ...node,
      geometry: PostGisGeometryAdapter.fromString(node.geometry),
    };
  }
}

interface SymbolTemplateNode extends DiagramNode {
  /** Human readable description */
  description: string;
}
export abstract class SymbolTemplateNodeAdapter {
  static modelName = 'SymbolTemplate';

  public static fromDiagramSymbol(
    diagramSymbol: DiagramSymbol,
    fpInfo: FilePageMixin
  ): SymbolTemplateNode {
    // flatten the svgPath structure into two arrays
    const svgCommands: string[] = [];
    const svgPathStyles: string[] = [];
    diagramSymbol.svgRepresentation.svgPaths.forEach((svgPath) => {
      svgCommands.push(svgPath.svgCommands);
      svgPathStyles.push(svgPath.style!);
    });

    return {
      ...fpInfo,
      svgCommands,
      svgPathStyles,
      geometry: PostGisGeometryAdapter.fromRect(
        diagramSymbol.svgRepresentation.boundingBox
      ),
      description: diagramSymbol.description,
    };
  }

  // Can reuse sanitize methods from DiagramNode
  public static sanitizeBeforeUpsert(node: SymbolTemplateNode): any {
    return DiagramNodeAdapter.sanitizeBeforeUpsert(node);
  }
  public static sanitizeAfterUpsert(node: any): SymbolTemplateNode {
    return {
      ...DiagramNodeAdapter.sanitizeAfterUpsert(node),
      description: node.description,
    };
  }
}
