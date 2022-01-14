/*
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer, CadModelBudget } from "@cognite/reveal";
import { AutoCadBudgetTool } from "@cognite/reveal/tools";
import dat from 'dat.gui';

/**
 * Creates UI controllers for controlling CAD budget relative to the initial
 * budget.
 */
export function initialCadBudgetUi(viewer: Cognite3DViewer, uiFolder: dat.GUI) {
  const state = {
    factor: 100.0,
    whileMovingCameraFactor: 50.0,
    autoAdjustBudgetTool: new AutoCadBudgetTool(viewer)
  };
  const defaultCadBudget = { ...viewer.cadBudget };
  const updateAtEaseBudget = () => updateBudget(defaultCadBudget, state.factor / 100, budget => state.autoAdjustBudgetTool.cameraAtEaseCadBudget = budget);
  const updateMovingBudget = () => updateBudget(defaultCadBudget, state.whileMovingCameraFactor / 100, budget => state.autoAdjustBudgetTool.cameraMovingCadBudget = budget);
  uiFolder.add(state, 'factor', 1, 500, 1).name('Budget factor (%)').onChange(updateAtEaseBudget);
  uiFolder.add(state, 'whileMovingCameraFactor', 1, 500, 1).name('Budget factor (%) while moving').onChange(updateMovingBudget);

  updateAtEaseBudget();
  updateMovingBudget();
}


function updateBudget(defaultBudget: CadModelBudget, factor: number, updateCallback: (newBudget: CadModelBudget) => void) {
  const newBudget: CadModelBudget = {
    highDetailProximityThreshold: defaultBudget.highDetailProximityThreshold * factor,
    maximumRenderCost: defaultBudget.maximumRenderCost * factor,
  };
  updateCallback(newBudget);
}