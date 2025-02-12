/*!
 * Copyright 2025 Cognite AS
 */
import { type CadModelOptions, type ModelStyleGroup } from '../../types';
import { isSameModel } from '../../../../utilities/isSameModel';

export function groupStyleGroupByModel(
  models: CadModelOptions[],
  styleGroup: ModelStyleGroup[]
): ModelStyleGroup[] {
  const initialStyleGroups = models.map((model) => ({ model, styleGroup: [] }));
  return styleGroup.reduce<ModelStyleGroup[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSameModel(group.model, currentGroup.model)
    );
    existingGroupWithModel?.styleGroup.push(...currentGroup.styleGroup);
    return accumulatedGroups;
  }, initialStyleGroups);
}
