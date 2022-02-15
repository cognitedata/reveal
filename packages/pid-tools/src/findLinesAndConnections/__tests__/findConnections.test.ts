import { PidDocument } from '../../pid';
import { DocumentType } from '../../types';
import { findConnections } from '../findConnections';

import { createLines, createSymbols } from './findLines.test';

describe('findConnections', () => {
  test('simple square line square all connected', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg>
        <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

        <path d="M 200,200 h 100 v 100 h -100 v -100" id="path002" />

        <path d="M 100,100 l 100,100" id="path003" />
    </svg>
    `);

    const symbolInstances = createSymbols(['path001', 'path002']);
    const lineInstances = createLines(['path003']);

    const connections = findConnections(
      symbolInstances,
      lineInstances,
      pidDocument,
      DocumentType.pid
    );
    expect(connections.length).toBe(2);
  });

  test('simple square line square two connected', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg>
        <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

        <path d="M 250,250 h 100 v 100 h -100 v -100" id="path002" />

        <path d="M 100,100 l 100,100" id="path003" />
    </svg>
    `);

    const symbolInstances = createSymbols(['path001', 'path002']);
    const lineInstances = createLines(['path003']);

    const connections = findConnections(
      symbolInstances,
      lineInstances,
      pidDocument,
      DocumentType.pid
    );
    expect(connections.length).toBe(1);
  });
});
