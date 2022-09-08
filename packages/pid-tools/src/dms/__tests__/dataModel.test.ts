// eslint-disable-next-line lodash/import-scope
import { isMatch } from 'lodash';

import {
  FilePageMixin,
  LineNodeAdapter,
  PostGisGeometry,
  PostGisGeometryAdapter,
  SymbolTemplateNodeAdapter,
  ViewboxNodeAdapter,
} from '../dataModel';
import { DiagramLineInstanceOutputFormat, DiagramSymbol, Rect } from '../..';

// Reusable objects
const rect: Rect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};
const pgGeom: PostGisGeometry = {
  type: 'LineString',
  coordinates: [
    [0, 0],
    [1, 1],
  ],
};
const pgGeomString = 'LINESTRING(0 0, 1 1)';
const fpInfo: Omit<FilePageMixin, 'modelName'> = {
  externalId: 'ext_id',
  fileId: 1,
  filePage: 1,
};
const diagramSymbol: DiagramSymbol = {
  id: '574655',
  symbolType: 'Instrument',
  description: 'blablabla',
  svgRepresentation: {
    boundingBox: {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
    svgPaths: [
      {
        svgCommands: 'some_svg_command',
        style: 'some_svg_style',
      },
    ],
  },
};

const diagramLineInstance: DiagramLineInstanceOutputFormat = {
  type: 'Line',
  id: 'path22670',
  pathIds: ['path22670'],
  labelIds: [],
  lineNumbers: [],
  inferedLineNumbers: [],
  svgRepresentation: {
    boundingBox: {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
    svgPaths: [
      {
        svgCommands: 'some_svg_command',
        style: 'some_svg_style',
      },
    ],
  },
  labels: [],
};

describe('PostGisGeometryAdapter', () => {
  // tests for string conversions
  test('toString', () => {
    const pgGeomToString = PostGisGeometryAdapter.toString(pgGeom);
    expect(pgGeomToString).toEqual(pgGeomString);
  });
  test('fromString', () => {
    const pgGeomFromString = PostGisGeometryAdapter.fromString(pgGeomString);
    expect(pgGeomFromString).toEqual(pgGeom);
  });
  test('toString + FromString roundtrip', () => {
    const pgGeomToString = PostGisGeometryAdapter.toString(pgGeom);
    const pgGeomToStringFromString =
      PostGisGeometryAdapter.fromString(pgGeomToString);
    expect(pgGeomToStringFromString).toEqual(pgGeom);
  });
  // Failure cases
  test('fromString failure no regex match', () => {
    const noRegexMatch = 'LINESTRING (0 0, 1 1)';
    expect(() => {
      PostGisGeometryAdapter.fromString(noRegexMatch);
    }).toThrow(`Malformatted PostGIS string: ${noRegexMatch}`);
  });
  test('fromString failure no numbers', () => {
    const withoutNumbers = 'LINESTRING(a b, c d)';
    expect(() => {
      PostGisGeometryAdapter.fromString(withoutNumbers);
    }).toThrow(`Malformatted PostGIS string: ${withoutNumbers}`);
  });

  // tests for rectangle conversions
  test('fromRect', () => {
    const pgGeomFromRect = PostGisGeometryAdapter.fromRect(rect);
    expect(pgGeomFromRect).toEqual(pgGeom);
  });
});

describe('ViewboxNodeAdapter', () => {
  const viewboxNode = ViewboxNodeAdapter.fromRect(rect, fpInfo);
  // conversion from other data types
  test('fromRect', () => {
    expect(isMatch(viewboxNode, fpInfo)).toBeTruthy();
    expect(viewboxNode.box).toEqual(pgGeom);
  });
});

describe('SymbolTemplateNodeAdapter', () => {
  test('fromDiagramSymbol', () => {
    const symbolTemplateNode = SymbolTemplateNodeAdapter.fromDiagramSymbol(
      diagramSymbol,
      fpInfo
    );
    // All FilePageMixin fields must match the input fpInfo
    expect(isMatch(symbolTemplateNode, fpInfo)).toBeTruthy();

    // svg fields must match the ones from svgRepresentation
    expect(symbolTemplateNode.svgPathCommands[0]).toEqual(
      diagramSymbol.svgRepresentation.svgPaths[0].svgCommands
    );
    expect(symbolTemplateNode.svgPathStyles[0]).toEqual(
      diagramSymbol.svgRepresentation.svgPaths[0].style
    );
    // "geometry" must be correctly constructed from svgRepresentation
    expect(symbolTemplateNode.geometry).toEqual(pgGeom);
    // description must match
    expect(symbolTemplateNode.description).toEqual(diagramSymbol.description);

    // DiagramSymbolid from is disregarded for now
    // DiagramSymbol.symbolType is disregarded for now
  });
});

describe('LineNodeAdapter', () => {
  test('fromDiagramLineInstance', () => {
    const lineNode = LineNodeAdapter.fromDiagramLineInstance(
      diagramLineInstance,
      fpInfo
    );
    // Discriminator keys must be the correct hardcoded values
    expect(lineNode.modelName).toEqual('Line');
    expect(lineNode.lineType).toEqual('Process');

    // All FilePageMixin fields must match the input fpInfo
    expect(isMatch(lineNode, fpInfo)).toBeTruthy();

    // svg fields must match the ones from svgRepresentation
    expect(lineNode.svgPathCommands[0]).toEqual(
      diagramLineInstance.svgRepresentation.svgPaths[0].svgCommands
    );
    expect(lineNode.svgPathStyles[0]).toEqual(
      diagramLineInstance.svgRepresentation.svgPaths[0].style
    );

    // "geometry" must be correctly constructed from svgRepresentation
    expect(lineNode.geometry).toEqual(pgGeom);

    // Line must be indirected
    expect(lineNode.isDirected).toEqual(0);
  });
});
