// eslint-disable-next-line lodash/import-scope
import { isMatch } from 'lodash';

import {
  DiagramNode,
  DiagramNodeAdapter,
  FilePageMixin,
  PostGisGeometry,
  PostGisGeometryAdapter,
  SymbolTemplateNodeAdapter,
  ViewboxNodeAdapter,
} from '../dataModel';
import { DiagramSymbol, Rect } from '../..';

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
const fpInfo: FilePageMixin = {
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
        style: 'some_svg_file',
      },
    ],
  },
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
  // sanitizing
  test('sanitizeBeforeUpsert', () => {
    const upsertFormat = ViewboxNodeAdapter.sanitizeBeforeUpsert(viewboxNode);
    // upsertFormat must still have the same fields except for "box"
    expect(isMatch(upsertFormat, fpInfo)).toBeTruthy();
    // "box" must be transformed into PostGIS string
    expect(upsertFormat.box).toEqual(pgGeomString);
  });
  test('sanitizeAfterUpsert', () => {
    const upsertFormat = {
      ...fpInfo,
      box: pgGeomString,
    };
    const viewboxNodeAfterUpsert =
      ViewboxNodeAdapter.sanitizeAfterUpsert(upsertFormat);
    expect(viewboxNodeAfterUpsert).toEqual(viewboxNode);
  });
  test('sanitizeBeforeUpsert + sanitizeAfterUpsert roundtrip', () => {
    const upsertFormat = ViewboxNodeAdapter.sanitizeBeforeUpsert(viewboxNode);
    const afterRoundtrip = ViewboxNodeAdapter.sanitizeAfterUpsert(upsertFormat);
    expect(afterRoundtrip).toEqual(viewboxNode);
  });
});

describe('DiagramNodeAdapter', () => {
  const diagramNodeWithoutGeometry = {
    ...fpInfo,
    svgCommands: [] as string[],
    svgPathStyles: [] as string[],
  };
  const diagramNode: DiagramNode = {
    ...diagramNodeWithoutGeometry,
    geometry: pgGeom,
  };
  test('sanitizeBeforeUpsert', () => {
    const upsertFormat = DiagramNodeAdapter.sanitizeBeforeUpsert(diagramNode);
    // upsertFormat must still have the same fields except for "geometry"
    expect(isMatch(upsertFormat, diagramNodeWithoutGeometry)).toBeTruthy();
    // "geometry" must be transformed into PostGIS string
    expect(upsertFormat.geometry).toEqual(pgGeomString);
  });
  test('sanitizeAfterUpsert', () => {
    const upsertFormat = {
      ...diagramNodeWithoutGeometry,
      geometry: pgGeomString,
    };
    const diagramNode = DiagramNodeAdapter.sanitizeAfterUpsert(upsertFormat);
    // All fields except "geometry" must be the same after sanitizing
    expect(isMatch(diagramNode, diagramNodeWithoutGeometry)).toBeTruthy();
    // "box" must be transformed into PostGIS JSON
    expect(diagramNode.geometry).toEqual(pgGeom);
  });
  test('sanitizeBeforeUpsert + sanitizeAfterUpsert roundtrip', () => {
    const upsertFormat = DiagramNodeAdapter.sanitizeBeforeUpsert(diagramNode);
    const afterRoundtrip = DiagramNodeAdapter.sanitizeAfterUpsert(upsertFormat);
    expect(afterRoundtrip).toEqual(diagramNode);
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
    expect(symbolTemplateNode.svgCommands[0]).toEqual(
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
