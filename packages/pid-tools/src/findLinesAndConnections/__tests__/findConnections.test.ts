import { PidDocument } from '../../pid';
import { DiagramType } from '../../types';
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
      DiagramType.PID
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
      DiagramType.PID
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
      DiagramType.PID
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
      DiagramType.PID
    );
    expect(connections.length).toBe(4);
  });

  test('symbol, line, symbol with typical instrument line gap', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 793.33 1122.67">

  <path d="M 141.76 328.05 v 15.34"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="notConnectedLine" />
  <path d="M 170.88 339.29 C 170.88 345.13, 166.13 349.88, 160.26 349.89 M 160.26 349.89 C 154.42 349.88, 149.67 345.13, 149.66 339.29 M 149.66 339.29 C 149.67 333.42, 154.42 328.67, 160.26 328.69 M 160.26 328.69 C 166.13 328.67, 170.88 333.42, 170.88 339.29"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="instrument" />
  <path d="M 153.52 331.11 l -4.32 -5.22"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="connectedLine" />
  <path d="M 141.76 320.21 l 10.62 5.30 v -5.30 l -10.62 5.30 v -5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="valve" />
</svg>
    `);

    const symbolInstances = createSymbols(['instrument', 'valve']);
    const lineInstances = createLines(['notConnectedLine', 'connectedLine']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument,
      DiagramType.PID
    );

    expect(connections.length).toBe(2);
    expect(
      connections[0].start === 'connectedLine' ||
        connections[0].end === 'connectedLine'
    ).toBe(true);
    expect(
      connections[1].start === 'connectedLine' ||
        connections[1].end === 'connectedLine'
    ).toBe(true);
  });
});
