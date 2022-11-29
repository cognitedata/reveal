/*!
 * Copyright 2021 Cognite AS
 */

import { LevelOfDetail } from '../../packages/cad-parsers/src/cad//LevelOfDetail';
import { WantedSector } from '../../packages/cad-parsers/src/cad/types';

export function expectContainsSectorsWithLevelOfDetail(
  sectors: WantedSector[],
  expectedSimple: number[],
  expectedDetailed: number[]
): void {
  for (const id of expectedSimple) {
    expect(sectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metadata: expect.objectContaining({ id }), levelOfDetail: LevelOfDetail.Simple })
      ])
    );
  }
  for (const id of expectedDetailed) {
    expect(sectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ metadata: expect.objectContaining({ id }), levelOfDetail: LevelOfDetail.Detailed })
      ])
    );
  }
}
