/*
 * Copyright 2021 Cognite AS
 */

import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';
import dat from 'dat.gui';

/**
 * Creates UI controllers for controlling CAD budget relative to the initial
 * budget.
 */
export function initialCadBudgetUi(viewer: Cognite3DViewer<DataSourceType>, uiFolder: dat.GUI) {
  const state = {
    factor: 200.0
  };
  const defaultCadBudget = { ...viewer.cadBudget };
  const onCadBudgetSettingsChanged = () => {
    const scale = state.factor / 100.0;
    viewer.cadBudget = {
      highDetailProximityThreshold: defaultCadBudget.highDetailProximityThreshold * scale,
      maximumRenderCost: defaultCadBudget.maximumRenderCost * scale
    };
  };
  uiFolder.add(state, 'factor', 1, 500, 1).name('Budget factor (%)').onChange(onCadBudgetSettingsChanged);
}
