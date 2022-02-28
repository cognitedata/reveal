import { PidDocument } from '../../pid';
import { DocumentType } from '../../types';
import { findConnectionsByTraversal } from '../findConnections';

import { createLines, createSymbols } from './findLines.test';

describe('findConnectionsByTraversal', () => {
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

    const connections = findConnectionsByTraversal(
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

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument,
      DocumentType.pid
    );
    expect(connections.length).toBe(1);
  });

  test('two squares with line jump connection in between', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg>
        <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

        <path d="M 100,50 h 80" id="path002" />
        
        <path d="M 200,50 h 80" id="path003" />
        
        <path d="M 300,50 h 80" id="path004" />
        
        <path d="M 380,0 h 100 v 100 h -100 v -100" id="path005" />
    </svg>
    `);

    const symbolInstances = createSymbols(['path001', 'path005']);
    const lineInstances = createLines(['path002', 'path003', 'path004']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument,
      DocumentType.pid
    );
    expect(connections.length).toBe(4);
  });

  test('symbol, line, symbol, line, symbol connection', () => {
    // If a line doens't enforce that the edge point only can be connected
    // to one instance, unwanted line jump connection would be added
    const pidDocument = PidDocument.fromNormalizedSvgString(`
    <svg>
        <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

        <path d="M 100,50 h 100" id="path002" />

        <path d="M 200,0 h 100 v 100 h -100 v -100" id="path003" />
        
        <path d="M 300,50 h 100" id="path004" />
        
        <path d="M 400,0 h 100 v 100 h -100 v -100" id="path005" />
    </svg>
    `);

    const symbolInstances = createSymbols(['path001', 'path003', 'path005']);
    const lineInstances = createLines(['path002', 'path004']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument,
      DocumentType.pid
    );
    expect(connections.length).toBe(4);
  });
});
