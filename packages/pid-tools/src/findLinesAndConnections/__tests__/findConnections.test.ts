/* eslint-disable no-restricted-syntax */
import { PidDocument } from '../../pid';
import { connectionHasInstanceId } from '../../utils/symbolUtils';
import { findConnectionsByTraversal } from '../findConnections';

import { createLines, createSymbols } from './findLines.test';

describe('findConnectionsByTraversal', () => {
  test('simple square line square all connected', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 1122.67 793.33">
    <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

    <path d="M 200,200 h 100 v 100 h -100 v -100" id="path002" />

    <path d="M 100,100 l 100,100" id="path003" />
</svg>
    `);

    const symbolInstances = createSymbols([['path001'], ['path002']]);
    const lineInstances = createLines(['path003']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
    );
    expect(connections.length).toBe(2);
  });

  test('simple square line square two connected', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 1122.67 793.33">
    <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

    <path d="M 250,250 h 100 v 100 h -100 v -100" id="path002" />

    <path d="M 100,100 l 100,100" id="path003" />
</svg>
    `);

    const symbolInstances = createSymbols([['path001'], ['path002']]);
    const lineInstances = createLines(['path003']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
    );
    expect(connections.length).toBe(1);
  });

  test('two squares with line jump connection in between', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 1122.67 793.33">
    <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

    <path d="M 100,50 h 80" id="path002" />

    <path d="M 200,50 h 80" id="path003" />

    <path d="M 300,50 h 80" id="path004" />

    <path d="M 380,0 h 100 v 100 h -100 v -100" id="path005" />
</svg>
    `);

    const symbolInstances = createSymbols([['path001'], ['path005']]);
    const lineInstances = createLines(['path002', 'path003', 'path004']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
    );
    expect(connections.length).toBe(4);
  });

  test('symbol, line, symbol, line, symbol connection', () => {
    // If a line doens't enforce that the edge point only can be connected
    // to one instance, unwanted line jump connection would be added
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 1122.67 793.33">
    <path d="M 0,0 h 100 v 100 h -100 v -100" id="path001" />

    <path d="M 100,50 h 100" id="path002" />

    <path d="M 200,0 h 100 v 100 h -100 v -100" id="path003" />

    <path d="M 300,50 h 100" id="path004" />

    <path d="M 400,0 h 100 v 100 h -100 v -100" id="path005" />
</svg>
    `);

    const symbolInstances = createSymbols([
      ['path001'],
      ['path003'],
      ['path005'],
    ]);
    const lineInstances = createLines(['path002', 'path004']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
    );
    expect(connections.length).toBe(4);
  });

  test('symbol, line, symbol with typical instrument line gap', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 1122.67 793.33">

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

    const symbolInstances = createSymbols([['instrument'], ['valve']]);
    const lineInstances = createLines(['notConnectedLine', 'connectedLine']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
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

  test('line flange valve', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 793.33 1122.67">

  <path d="M 209.86 86.49 h -94.60"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="line" />
  <path d="M 209.86 83.85 v 5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="flange" />
  <path d="M 211.18 89.15 v -5.30 l 10.62 5.30 v -5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="valve" />
</svg>
`);

    const symbolInstances = createSymbols([['flange'], ['valve']]);
    const lineInstances = createLines(['line']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
    );

    expect(connections.length).toBe(2);
  });

  test('line flange valve flange valve flange line', () => {
    const pidDocument = PidDocument.fromNormalizedSvgString(`
<?xml version="1.0" encoding="UTF-8" standalone="no"?>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0.00 0.00 1122.67 793.33">

  <path d="M 209.86 86.49 h -94.60"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="left-line" />
  <path d="M 209.86 83.85 v 5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="left-flange" />
  <path d="M 211.18 89.15 v -5.30 l 10.62 5.30 v -5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="left-valve" />
  <path d="M 221.80 89.15 v -5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="middle-flange-path-left" />
  <path d="M 223.12 83.85 v 5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="middle-flange-path-right" />
  <path d="M 235.52 87.39 l 3.50 1.76 v -5.30 l -3.50 1.74"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="right-valve-path1" />
  <path d="M 235.70 86.49 C 235.72 87.77, 234.68 88.81, 233.38 88.81 M 233.38 88.81 C 232.12 88.81, 231.08 87.77, 231.06 86.49 M 231.06 86.49 C 231.08 85.20, 232.12 84.17, 233.38 84.17 M 233.38 84.17 C 234.68 84.17, 235.72 85.20, 235.70 86.49"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="right-valve-path2" />
  <path d="M 226.62 87.39 l -3.50 1.76 v -5.30 l 3.50 1.74"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="right-valve-path3" />
  <path d="M 231.06 86.49 C 231.08 87.77, 230.04 88.81, 228.74 88.81 M 228.74 88.81 C 227.48 88.81, 226.44 87.77, 226.42 86.49 M 226.42 86.49 C 226.44 85.20, 227.48 84.17, 228.74 84.17 M 228.74 84.17 C 230.04 84.17, 231.08 85.20, 231.06 86.49"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="right-valve-path4" />
  <path d="M 240.34 89.15 v -5.30"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="right-flange" />
  <path d="M 240.34 86.49 h 19.88"
    style="fill:none;stroke:#000000;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;stroke-dasharray:none;stroke-opacity:1"
    id="right-line" />
</svg>
`);

    const symbolInstances = createSymbols([
      ['left-flange'],
      ['left-valve'],
      ['middle-flange-path-left', 'middle-flange-path-right'],
      ['right-valve-path1', 'right-valve-path2', 'right-valve-path3'],
      ['right-flange'],
    ]);
    const lineInstances = createLines(['left-line', 'right-line']);

    const connections = findConnectionsByTraversal(
      symbolInstances,
      lineInstances,
      pidDocument
    );

    // expected connections: left-line - left-flange - left-valve - middle-flange - right-valve - right-flange - right-line
    expect(connections.length).toBe(6);

    // each line should have one connection
    for (const line of lineInstances) {
      expect(
        connections.filter((c) => connectionHasInstanceId(line.id, c)).length
      ).toBe(1);
    }

    // each symbol should have two connections
    for (const symbol of symbolInstances) {
      expect(
        connections.filter((c) => connectionHasInstanceId(symbol.id, c)).length
      ).toBe(2);
    }
  });
});
