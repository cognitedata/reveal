import {
  PidFileConnectionInstance,
  GraphDocument,
  LineConnectionInstance,
} from '../../types';
import { findIsoLink, findPidLink } from '../links';
import { DocumentLink } from '../types';

import * as pid25 from './data/025Graph.json';
import * as pid26 from './data/026Graph.json';
import * as iso1 from './data/iso1.json';
import * as iso2 from './data/iso2.json';

test('should find the matching file connection in pid26', async () => {
  const fileConnection = {
    fileDirection: 'Out',
    documentNumber: 26,
    toPosition: 'A1',
    id: 'path1',
    pathIds: ['path1'],
  } as unknown as PidFileConnectionInstance;

  const expectedLink: DocumentLink = {
    from: {
      documentId: 'PARSED_DIAGRAM_V1_025Graph.json',
      annotationId: 'path1',
    },
    to: {
      documentId: 'PARSED_DIAGRAM_V1_026Graph.json',
      annotationId: 'path1',
    },
  };

  const link = findPidLink(
    fileConnection,
    pid25 as GraphDocument,
    [pid26 as GraphDocument],
    '1'
  );

  expect(link).toEqual(expectedLink);
});

test('should not find file connection with document number 27 in pid26', async () => {
  const fileConnection = {
    fileDirection: 'Out',
    documentNumber: 27,
    toPosition: 'A1',
    id: 'path1',
    pathIds: ['path1'],
  } as unknown as PidFileConnectionInstance;

  const link = findPidLink(
    fileConnection,
    pid25 as GraphDocument,
    [pid26 as GraphDocument],
    '1'
  );

  expect(link).toEqual(undefined);
});

test('find correct SAME iso link', async () => {
  const isoConnection: LineConnectionInstance = {
    type: 'Line connection',
    symbolId: 's1',
    letterIndex: 'A',
    pointsToFileName: 'SAME',
    scale: 1,
    rotation: 0,
    pathIds: ['path1'],
    id: 'path1',
    labelIds: [],
    lineNumbers: [],
    inferedLineNumbers: [],
  };

  const link = findIsoLink(
    isoConnection,
    iso1 as GraphDocument,
    [iso1 as GraphDocument, iso2 as GraphDocument],
    '1'
  );

  expect(link).toEqual({
    from: {
      documentId: 'PARSED_DIAGRAM_V1_L1-1.json',
      annotationId: 'path1',
    },
    to: {
      documentId: 'PARSED_DIAGRAM_V1_L1-1.json',
      annotationId: 'path2',
    },
  });
});

test('find correct external iso link with same id', async () => {
  const isoConnection: LineConnectionInstance = {
    type: 'Line connection',
    symbolId: 'S1',
    letterIndex: 'A',
    pointsToFileName: 'L1-2',
    pathIds: ['path3'],
    id: 'path3',
    scale: 1,
    rotation: 0,
    labelIds: [],
    lineNumbers: [],
    inferedLineNumbers: [],
  };

  const link = findIsoLink(
    isoConnection,
    iso1 as GraphDocument,
    [iso1 as GraphDocument, iso2 as GraphDocument],
    '1'
  );

  expect(link).toEqual({
    from: {
      documentId: 'PARSED_DIAGRAM_V1_L1-1.json',
      annotationId: 'path3',
    },
    to: {
      documentId: 'PARSED_DIAGRAM_V1_L1-2.json',
      annotationId: 'path3',
    },
  });
});
