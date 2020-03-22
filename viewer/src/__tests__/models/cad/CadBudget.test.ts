/*!
 * Copyright 2020 Cognite AS
 */

import { createDefaultCadBudget } from '../../../models/cad/CadBudget';
import { SectorScene, SectorMetadata } from '../../../models/cad/types';

describe('CadBudgetImpl', () => {
  const sectorScene: SectorScene = {
    sectors: new Map<number, SectorMetadata>()
  } as any;

  test('filter with empty list returns empty list', () => {
    const budget = createDefaultCadBudget();
    const result = budget.filter([], sectorScene);
    expect(result).toBeEmpty();
  });
});
