/*!
 * Copyright 2021 Cognite AS
 */
import { jest } from '@jest/globals';
import { Box3 } from 'three';
import { SectorNode } from './SectorNode';
import { Mock } from 'moq.ts';
import type { AutoDisposeGroup } from '@reveal/utilities';

describe(SectorNode.name, () => {
  test('dereferencing a disposed group should not crash', async () => {
    const sectorNode = new SectorNode(1, 'testSector', new Box3());
    const isDisposedMock = jest.fn<() => boolean>();
    const group = new Mock<AutoDisposeGroup>()
      .setup(p => p.reference())
      .returns()
      .setup(p => p.isDisposed())
      .callback(isDisposedMock)
      .object();

    isDisposedMock.mockReturnValue(false);
    sectorNode.updateGeometry(group, sectorNode.levelOfDetail);

    isDisposedMock.mockReturnValue(true);
    expect(() => sectorNode.dereference()).not.toThrow();
  });
});
