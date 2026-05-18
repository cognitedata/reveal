/*!
 * Copyright 2026 Cognite AS
 */

import { File3dFormat } from '../types';
import { CdfModelIdentifier } from './CdfModelIdentifier';

describe(CdfModelIdentifier.name, () => {
  test('should create instance with correct modelId and revisionId', () => {
    const id = new CdfModelIdentifier(100, 200);

    expect(id.modelId).toBe(100);
    expect(id.revisionId).toBe(200);
    expect(typeof id.revealInternalId).toBe('symbol');
  });

  test('outputFormat is undefined when not provided', () => {
    const id = new CdfModelIdentifier(100, 200);

    expect(id.outputFormat).toBeUndefined();
  });

  test('outputFormat is stored when provided', () => {
    const id = new CdfModelIdentifier(100, 200, File3dFormat.GltfPrioritizedNodes);

    expect(id.outputFormat).toBe('gltf-prioritized-nodes-directory');
  });

  test('revealInternalId symbol does not include outputFormat suffix when unset', () => {
    const id = new CdfModelIdentifier(100, 200);

    expect(id.revealInternalId.toString()).toBe('Symbol(100/200)');
  });

  test('revealInternalId symbol includes outputFormat suffix when set', () => {
    const id = new CdfModelIdentifier(100, 200, File3dFormat.GltfPrioritizedNodes);

    expect(id.revealInternalId.toString()).toBe('Symbol(100/200/gltf-prioritized-nodes-directory)');
  });

  test('same modelId/revisionId with different outputFormats produce unique symbols', () => {
    const id1 = new CdfModelIdentifier(100, 200);
    const id2 = new CdfModelIdentifier(100, 200, File3dFormat.GltfPrioritizedNodes);

    expect(id1.revealInternalId).not.toBe(id2.revealInternalId);
  });

  test('sourceModelIdentifier omits outputFormat when not set', () => {
    const id = new CdfModelIdentifier(100, 200);

    expect(id.sourceModelIdentifier()).toBe('cdf-classic: 100/200');
  });

  test('sourceModelIdentifier appends outputFormat when set', () => {
    const id = new CdfModelIdentifier(100, 200, File3dFormat.GltfPrioritizedNodes);

    expect(id.sourceModelIdentifier()).toBe('cdf-classic: 100/200/gltf-prioritized-nodes-directory');
  });

  test('toString includes class name and symbol', () => {
    const id = new CdfModelIdentifier(100, 200);

    expect(id.toString()).toMatch(/^CdfModelIdentifier \(Symbol\(100\/200\)\)$/);
  });
});
