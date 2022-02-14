import { FileConnectionInstance, GraphDocument } from '../../types';
import { findPidLink } from '../links';
import { DocumentLink } from '../types';

import * as pid25 from './data/025Graph.json';
import * as pid26 from './data/026Graph.json';

test('should find the matching file connection in pid26', async () => {
  const fileConnection = {
    fileDirection: 'Out',
    documentNumber: 26,
    toPosition: 'A1',
    id: 'path1',
    pathIds: ['path1'],
  } as unknown as FileConnectionInstance;

  const expectedLink: DocumentLink = {
    from: {
      documentId: pid25.documentMetadata.name,
      annotationId: 'path1',
    },
    to: {
      documentId: pid26.documentMetadata.name,
      annotationId: 'path1',
    },
  };

  const link = findPidLink(fileConnection, pid25 as GraphDocument, [
    pid26 as GraphDocument,
  ]);

  expect(link).toEqual(expectedLink);
});

test('should not find file connection with document number 27 in pid26', async () => {
  const fileConnection = {
    fileDirection: 'Out',
    documentNumber: 27,
    toPosition: 'A1',
    id: 'path1',
    pathIds: ['path1'],
  } as unknown as FileConnectionInstance;

  const link = findPidLink(fileConnection, pid25 as GraphDocument, [
    pid26 as GraphDocument,
  ]);

  expect(link).toEqual(undefined);
});
