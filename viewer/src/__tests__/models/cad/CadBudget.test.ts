/*!
 * Copyright 2020 Cognite AS
 */

import { createDefaultCadBudget } from '@/dataModels/cad/public/CadBudget';
import { SectorMetadata } from '@/dataModels/cad/internal/sector/types';
import { SectorScene } from '@/dataModels/cad/internal/sector/SectorScene';

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
