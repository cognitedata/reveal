/*!
 * Copyright 2025 Cognite AS
 */
import { Mock } from 'moq.ts';
import { CadNode } from './CadNode';
import { SectorRepository } from '@reveal/sector-loader';

import { jest } from '@jest/globals';
import { createCadNode } from '../../../../test-utilities/src/createCadNode';

describe(CadNode.name, () => {
  test('should not call sector repository cache clear on removal', () => {
    const sectorRepositoryMock = new Mock<SectorRepository>()
      .setup(p => p.clearCache)
      .returns(jest.fn())
      .object();

    const cadNode = createCadNode(3, 3, { sectorRepository: sectorRepositoryMock });

    cadNode.dispose();

    expect(jest.mocked(sectorRepositoryMock).clearCache).not.toHaveBeenCalled();
  });
});
