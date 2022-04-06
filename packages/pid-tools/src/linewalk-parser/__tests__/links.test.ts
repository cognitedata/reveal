import { SymbolConnection } from '../../graphMatching/types';
import {
  PidFileConnectionInstance,
  GraphDocument,
  LineConnectionInstanceOutputFormat,
} from '../../types';
import { findIsoLink, findPidLink } from '../links';

import * as pid25 from './data/025Graph.json';
import * as pid26 from './data/026Graph.json';
import * as iso1 from './data/iso1.json';
import * as iso2 from './data/iso2.json';

const boundingBox = { x: 0, y: 0, width: 0, height: 0 };

const getLabelFromText = (id: string, text: string) => {
  return {
    id: 'mock-id',
    text,
    boundingBox,
  };
};

test('should find the matching file connection in pid26', async () => {
  const fileConnection = {
    fileDirection: 'Out',
    documentNumber: 26,
    toPosition: 'A1',
    id: 'path1',
    pathIds: ['path1'],
  } as unknown as PidFileConnectionInstance;

  const expectedLink: SymbolConnection = {
    from: {
      fileName: '025Graph.svg',
      instanceId: 'path1',
    },
    to: {
      fileName: '026Graph.svg',
      instanceId: 'path1',
    },
  };

  const link = findPidLink(fileConnection, pid25 as GraphDocument, [
    pid26 as GraphDocument,
  ]);

  expect(link).toEqual(expectedLink);
});

test('should not find File Connection with document number 27 in pid26', async () => {
  const fileConnection = {
    fileDirection: 'Out',
    documentNumber: 27,
    toPosition: 'A1',
    id: 'path1',
    pathIds: ['path1'],
  } as unknown as PidFileConnectionInstance;

  const link = findPidLink(fileConnection, pid25 as GraphDocument, [
    pid26 as GraphDocument,
  ]);

  expect(link).toEqual(undefined);
});

test('find correct SAME iso link', async () => {
  const isoConnection: LineConnectionInstanceOutputFormat = {
    type: 'Line Connection',
    symbolId: 's1',
    letterIndex: 'A',
    pointsToFileName: 'SAME',
    scale: 1,
    rotation: 0,
    pathIds: ['path1'],
    id: 'path1',
    labelIds: [],
    labels: [],
    svgRepresentation: { boundingBox, svgPaths: [] },
    lineNumbers: [],
    inferedLineNumbers: [],
  };

  const link = findIsoLink(isoConnection, iso1 as GraphDocument, [
    iso1 as GraphDocument,
    iso2 as GraphDocument,
  ]);

  expect(link).toEqual({
    from: {
      fileName: iso1.documentMetadata.name,
      instanceId: 'path1',
    },
    to: {
      fileName: iso1.documentMetadata.name,
      instanceId: 'path2',
    },
  } as SymbolConnection);
});

test('find correct external iso link with same id', async () => {
  const labels = [getLabelFromText('tspan1', 'L001-2')];
  const isoConnection: LineConnectionInstanceOutputFormat = {
    type: 'Line Connection',
    symbolId: 'S1',
    letterIndex: 'A',
    pathIds: ['path3'],
    id: 'path3',
    scale: 1,
    rotation: 0,
    labels,
    svgRepresentation: { boundingBox, svgPaths: [] },
    labelIds: labels.map((label) => label.id),
    lineNumbers: [],
    inferedLineNumbers: [],
  };

  const link = findIsoLink(isoConnection, iso1 as GraphDocument, [
    iso1 as GraphDocument,
    iso2 as GraphDocument,
  ]);

  expect(link).toEqual({
    from: {
      fileName: iso1.documentMetadata.name,
      instanceId: 'path3',
    },
    to: {
      fileName: iso2.documentMetadata.name,
      instanceId: 'path3',
    },
  } as SymbolConnection);
});
